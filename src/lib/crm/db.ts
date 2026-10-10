import { PrismaClient } from "@prisma/client";
import { createTursoPrisma } from "./turso";
import { ENCRYPTED_FIELDS, decryptResult, encryptWriteData } from "./field-crypto";

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

const base: PrismaClient =
  tursoUrl && tursoToken
    ? createTursoPrisma(tursoUrl, tursoToken)
    : new PrismaClient();

/**
 * Personal data is encrypted on the way into the database and decrypted on the
 * way out, so the rest of the code keeps working with plain values.
 * Raw queries ($queryRaw) bypass this — they must not read encrypted columns.
 */
export const prisma = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, args, query }) {
        if (ENCRYPTED_FIELDS[model]) {
          const a = args as Record<string, unknown>;
          if (a.data !== undefined) a.data = encryptWriteData(model, a.data);
          if (a.create !== undefined) a.create = encryptWriteData(model, a.create);
          if (a.update !== undefined) a.update = encryptWriteData(model, a.update);
        }
        return decryptResult(await query(args));
      },
    },
  },
}) as unknown as PrismaClient;
