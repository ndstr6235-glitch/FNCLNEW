import { prisma } from "./db";

const MIN = 100_000_000;
const MAX = 999_999_999;

export async function generateUniqueVS(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const vs = String(Math.floor(MIN + Math.random() * (MAX - MIN)));
    const existing = await prisma.payment.findFirst({ where: { variableSymbol: vs }, select: { id: true } });
    if (!existing) return vs;
  }
  return String(Date.now()).slice(-9);
}
