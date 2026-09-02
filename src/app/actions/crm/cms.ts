"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== "administrator") return null;
  return session;
}

// ---------------------------------------------------------------------------
// WebEmission CRUD
// ---------------------------------------------------------------------------

export async function getEmissions() {
  return prisma.webEmission.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function upsertEmission(data: {
  id?: string;
  name: string;
  location: string;
  yieldPa: string;
  maturity: string;
  minEntry: string;
  active: boolean;
  sortOrder: number;
}) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  const { id, ...rest } = data;
  if (id) {
    await prisma.webEmission.update({ where: { id }, data: rest });
  } else {
    await prisma.webEmission.create({ data: rest });
  }
  revalidatePath("/cms");
  return { success: true };
}

export async function deleteEmission(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webEmission.delete({ where: { id } });
  revalidatePath("/cms");
  return { success: true };
}

// ---------------------------------------------------------------------------
// WebProject CRUD
// ---------------------------------------------------------------------------

export async function getProjects() {
  return prisma.webProject.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function upsertProject(data: {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  status?: string;
  sortOrder: number;
}) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  const { id, ...rest } = data;
  if (id) {
    await prisma.webProject.update({ where: { id }, data: rest });
  } else {
    await prisma.webProject.create({ data: rest });
  }
  revalidatePath("/cms");
  return { success: true };
}

export async function deleteProject(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webProject.delete({ where: { id } });
  revalidatePath("/cms");
  return { success: true };
}

// ---------------------------------------------------------------------------
// WebStat CRUD
// ---------------------------------------------------------------------------

export async function getStats() {
  return prisma.webStat.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function upsertStat(data: {
  id?: string;
  value: string;
  label: string;
  sortOrder: number;
}) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  const { id, ...rest } = data;
  if (id) {
    await prisma.webStat.update({ where: { id }, data: rest });
  } else {
    await prisma.webStat.create({ data: rest });
  }
  revalidatePath("/cms");
  return { success: true };
}

export async function deleteStat(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webStat.delete({ where: { id } });
  revalidatePath("/cms");
  return { success: true };
}

// ---------------------------------------------------------------------------
// WebContent CRUD
// ---------------------------------------------------------------------------

export async function getContents() {
  return prisma.webContent.findMany();
}

export async function upsertContent(key: string, value: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webContent.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath("/cms");
  return { success: true };
}

export async function deleteContent(key: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webContent.delete({ where: { key } });
  revalidatePath("/cms");
  return { success: true };
}

// ---------------------------------------------------------------------------
// WebNews CRUD
// ---------------------------------------------------------------------------

export async function getNews() {
  return prisma.webNews.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function upsertNews(data: {
  id?: string;
  title: string;
  date: string;
  content?: string;
  active: boolean;
  sortOrder: number;
}) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  const { id, ...rest } = data;
  if (id) {
    await prisma.webNews.update({ where: { id }, data: rest });
  } else {
    await prisma.webNews.create({ data: rest });
  }
  revalidatePath("/cms");
  return { success: true };
}

export async function deleteNews(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webNews.delete({ where: { id } });
  revalidatePath("/cms");
  return { success: true };
}

// ---------------------------------------------------------------------------
// WebTestimonial CRUD
// ---------------------------------------------------------------------------

export async function getTestimonials() {
  return prisma.webTestimonial.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function upsertTestimonial(data: {
  id?: string;
  quote: string;
  author: string;
  role?: string;
  description?: string;
  imageBefore?: string;
  imageAfter?: string;
  active: boolean;
  sortOrder: number;
}) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  const { id, ...rest } = data;
  if (id) {
    await prisma.webTestimonial.update({ where: { id }, data: rest });
  } else {
    await prisma.webTestimonial.create({ data: rest });
  }
  revalidatePath("/cms");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Nemáte oprávnění" };
  await prisma.webTestimonial.delete({ where: { id } });
  revalidatePath("/cms");
  return { success: true };
}
