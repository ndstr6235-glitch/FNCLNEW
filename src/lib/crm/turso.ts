import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export function createTursoPrisma(url: string, token: string): PrismaClient {
  const adapter = new PrismaLibSql({ url, authToken: token });
  return new PrismaClient({ adapter } as never);
}
