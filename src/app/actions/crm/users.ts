"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  signature: string;
  dailyLeadQuota: number;
  createdAt: string;
}

export async function getUsers(): Promise<UserRow[]> {
  const session = await getSession();
  if (!session) return [];

  // Only admin + supervisor can access
  if (session.role === "broker") return [];

  const users = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role.toLowerCase(),
    active: u.active,
    signature: u.signature || "",
    dailyLeadQuota: u.dailyLeadQuota,
    createdAt: u.createdAt.toISOString().split("T")[0],
  }));
}

const MIN_PASSWORD_LEN = 8;

function validatePassword(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LEN) {
    return `Heslo musí mít alespoň ${MIN_PASSWORD_LEN} znaků`;
  }
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
    return "Heslo musí obsahovat alespoň jedno písmeno a jednu číslici";
  }
  return null;
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  dailyLeadQuota?: number;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  const pwError = validatePassword(data.password);
  if (pwError) {
    return { success: false, error: pwError };
  }

  // Check unique email
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return { success: false, error: "Email je již registrován" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const quota =
    typeof data.dailyLeadQuota === "number" && data.dailyLeadQuota >= 0
      ? Math.min(150, Math.floor(data.dailyLeadQuota))
      : 150;

  await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role.toUpperCase() as "ADMINISTRATOR" | "SUPERVISOR" | "BROKER",
      active: true,
      dailyLeadQuota: quota,
    },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password?: string;
    dailyLeadQuota?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  // Check unique email (excluding self)
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing && existing.id !== id) {
    return { success: false, error: "Email je již registrován" };
  }

  const updateData: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role.toUpperCase() as "ADMINISTRATOR" | "SUPERVISOR" | "BROKER",
  };

  if (data.password) {
    const pwError = validatePassword(data.password);
    if (pwError) {
      return { success: false, error: pwError };
    }
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (typeof data.dailyLeadQuota === "number" && data.dailyLeadQuota >= 0) {
    updateData.dailyLeadQuota = Math.min(150, Math.floor(data.dailyLeadQuota));
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/users");
  return { success: true };
}

export async function toggleUserActive(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (id === session.id) {
    return { success: false, error: "Nelze deaktivovat sám sebe" };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { success: false, error: "Uživatel nenalezen" };

  await prisma.user.update({
    where: { id },
    data: { active: !user.active },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (id === session.id) {
    return { success: false, error: "Nelze smazat sám sebe" };
  }

  // Check if user has clients
  const clientCount = await prisma.client.count({
    where: { assignedTo: id },
  });
  if (clientCount > 0) {
    return {
      success: false,
      error: `Uživatel má přiřazených ${clientCount} klientů. Nejprve je přeřaďte.`,
    };
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/users");
  return { success: true };
}
