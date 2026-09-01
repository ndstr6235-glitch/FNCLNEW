/**
 * Push Prisma schema to Turso (libsql) and seed users + email templates.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx prisma/turso-push.ts
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

// -- Schema SQL (generated via: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script)
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "role" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "signature" TEXT, "dailyLeadQuota" INTEGER NOT NULL DEFAULT 150, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Client" ("id" TEXT NOT NULL PRIMARY KEY, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "phone" TEXT NOT NULL, "email" TEXT NOT NULL, "birthDate" TEXT NOT NULL DEFAULT '', "street" TEXT NOT NULL DEFAULT '', "city" TEXT NOT NULL DEFAULT '', "zip" TEXT NOT NULL DEFAULT '', "bankAccount" TEXT NOT NULL DEFAULT '', "dnc" BOOLEAN NOT NULL DEFAULT false, "lastCallOutcome" TEXT NOT NULL DEFAULT '', "lastCalledAt" TEXT NOT NULL DEFAULT '', "callDate" TEXT NOT NULL DEFAULT '', "nextPaymentDate" TEXT NOT NULL DEFAULT '', "paymentFreq" INTEGER NOT NULL DEFAULT 30, "note" TEXT NOT NULL DEFAULT '', "stage" TEXT NOT NULL DEFAULT 'NEW', "source" TEXT NOT NULL DEFAULT '', "metadata" TEXT NOT NULL DEFAULT '{}', "assignedTo" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Client_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "LeadAssignment" ("id" TEXT NOT NULL PRIMARY KEY, "clientId" TEXT NOT NULL, "userId" TEXT NOT NULL, "assignedBy" TEXT NOT NULL, "reason" TEXT NOT NULL DEFAULT 'cron', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LeadAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "LeadAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Payment" ("id" TEXT NOT NULL PRIMARY KEY, "amount" REAL NOT NULL, "percent" REAL NOT NULL, "profit" REAL NOT NULL, "date" TEXT NOT NULL, "note" TEXT NOT NULL DEFAULT '', "duration" INTEGER NOT NULL DEFAULT 12, "monthlyPayout" REAL NOT NULL DEFAULT 0, "payoutFrequency" TEXT NOT NULL DEFAULT 'monthly', "paid" BOOLEAN NOT NULL DEFAULT false, "paidAt" TEXT NOT NULL DEFAULT '', "clientId" TEXT NOT NULL, "variableSymbol" TEXT, CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "CalEvent" ("id" TEXT NOT NULL PRIMARY KEY, "clientId" TEXT, "userId" TEXT NOT NULL, "paymentId" TEXT, "type" TEXT NOT NULL, "title" TEXT NOT NULL, "date" TEXT NOT NULL, "time" TEXT NOT NULL, "note" TEXT NOT NULL DEFAULT '', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CalEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "CalEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "EmailTemplate" ("id" TEXT NOT NULL PRIMARY KEY, "label" TEXT NOT NULL, "subject" TEXT NOT NULL, "body" TEXT NOT NULL, "allowedRoles" TEXT NOT NULL DEFAULT 'ADMINISTRATOR,SUPERVISOR,BROKER')`,
  `CREATE TABLE IF NOT EXISTS "Document" ("id" TEXT NOT NULL PRIMARY KEY, "clientId" TEXT NOT NULL, "name" TEXT NOT NULL, "fileName" TEXT NOT NULL, "fileUrl" TEXT NOT NULL, "fileSize" INTEGER NOT NULL, "mimeType" TEXT NOT NULL, "uploadedBy" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Notification" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "read" BOOLEAN NOT NULL DEFAULT false, "link" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Activity" ("id" TEXT NOT NULL PRIMARY KEY, "clientId" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "description" TEXT NOT NULL, "metadata" TEXT NOT NULL DEFAULT '{}', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entityId" TEXT, "details" TEXT, "ipAddress" TEXT, "userAgent" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "SentEmail" ("id" TEXT NOT NULL PRIMARY KEY, "clientId" TEXT NOT NULL, "userId" TEXT NOT NULL, "to" TEXT NOT NULL, "subject" TEXT NOT NULL, "body" TEXT NOT NULL, "templateLabel" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SentEmail_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "SentEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "SystemSetting" ("key" TEXT NOT NULL PRIMARY KEY, "value" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "Call" ("id" TEXT NOT NULL PRIMARY KEY, "clientId" TEXT NOT NULL, "userId" TEXT NOT NULL, "outcome" TEXT NOT NULL, "note" TEXT NOT NULL DEFAULT '', "durationSec" INTEGER NOT NULL DEFAULT 0, "callbackAt" TEXT NOT NULL DEFAULT '', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Call_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "Call_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "LoginAttempt" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "ipAddress" TEXT, "success" BOOLEAN NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Ticket" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '', "status" TEXT NOT NULL DEFAULT 'OPEN', "priority" TEXT NOT NULL DEFAULT 'MEDIUM', "fromUserId" TEXT NOT NULL, "assigneeId" TEXT, "clientId" TEXT, "resolvedAt" TEXT NOT NULL DEFAULT '', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Ticket_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Ticket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "TicketMessage" ("id" TEXT NOT NULL PRIMARY KEY, "ticketId" TEXT NOT NULL, "userId" TEXT NOT NULL, "message" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  // Unique indexes
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Payment_variableSymbol_key" ON "Payment"("variableSymbol")`,
  // Regular indexes
  `CREATE INDEX IF NOT EXISTS "Client_assignedTo_idx" ON "Client"("assignedTo")`,
  `CREATE INDEX IF NOT EXISTS "Client_assignedTo_lastCallOutcome_idx" ON "Client"("assignedTo", "lastCallOutcome")`,
  `CREATE INDEX IF NOT EXISTS "Client_assignedTo_createdAt_idx" ON "Client"("assignedTo", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Client_assignedTo_source_idx" ON "Client"("assignedTo", "source")`,
  `CREATE INDEX IF NOT EXISTS "Client_stage_idx" ON "Client"("stage")`,
  `CREATE INDEX IF NOT EXISTS "Client_nextPaymentDate_idx" ON "Client"("nextPaymentDate")`,
  `CREATE INDEX IF NOT EXISTS "Client_phone_idx" ON "Client"("phone")`,
  `CREATE INDEX IF NOT EXISTS "Client_email_idx" ON "Client"("email")`,
  `CREATE INDEX IF NOT EXISTS "Client_source_idx" ON "Client"("source")`,
  `CREATE INDEX IF NOT EXISTS "Client_createdAt_idx" ON "Client"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Client_dnc_idx" ON "Client"("dnc")`,
  `CREATE INDEX IF NOT EXISTS "LeadAssignment_userId_createdAt_idx" ON "LeadAssignment"("userId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "LeadAssignment_clientId_idx" ON "LeadAssignment"("clientId")`,
  `CREATE INDEX IF NOT EXISTS "Payment_paid_idx" ON "Payment"("paid")`,
  `CREATE INDEX IF NOT EXISTS "Payment_clientId_paid_idx" ON "Payment"("clientId", "paid")`,
  `CREATE INDEX IF NOT EXISTS "Payment_variableSymbol_idx" ON "Payment"("variableSymbol")`,
  `CREATE INDEX IF NOT EXISTS "CalEvent_paymentId_idx" ON "CalEvent"("paymentId")`,
  `CREATE INDEX IF NOT EXISTS "CalEvent_userId_date_idx" ON "CalEvent"("userId", "date")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
  `CREATE INDEX IF NOT EXISTS "Call_clientId_createdAt_idx" ON "Call"("clientId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Call_userId_createdAt_idx" ON "Call"("userId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Call_outcome_idx" ON "Call"("outcome")`,
  `CREATE INDEX IF NOT EXISTS "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "LoginAttempt_email_createdAt_idx" ON "LoginAttempt"("email", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Ticket_status_priority_idx" ON "Ticket"("status", "priority")`,
  `CREATE INDEX IF NOT EXISTS "Ticket_assigneeId_status_idx" ON "Ticket"("assigneeId", "status")`,
  `CREATE INDEX IF NOT EXISTS "Ticket_fromUserId_idx" ON "Ticket"("fromUserId")`,
  `CREATE INDEX IF NOT EXISTS "Ticket_clientId_idx" ON "Ticket"("clientId")`,
  `CREATE INDEX IF NOT EXISTS "TicketMessage_ticketId_createdAt_idx" ON "TicketMessage"("ticketId", "createdAt")`,
];

// -- Seed data --
const USERS = [
  { id: "u1", firstName: "Admin", lastName: "Puskin", email: "admin@puskinpartners.cz", password: "Puskin2026!", role: "ADMINISTRATOR", signature: "S pozdravem,\nPuskin and Partners | Administrace\nwww.puskinpartners.cz" },
  { id: "u2", firstName: "Miroslav", lastName: "Fencl", email: "fencl@puskinpartners.cz", password: "Fencl123456", role: "ADMINISTRATOR", signature: "S pozdravem,\nMiroslav Fencl | Puskin and Partners\nwww.puskinpartners.cz" },
];

const TEMPLATES = [
  { id: "t1", label: "Prezentace", subject: "Predstaveni spolecnosti – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nna zaklade naseho hovoru si Vam dovoluji zaslat prezentaci spolecnosti Puskin and Partners.\n\nV priloze naleznete podrobne informace o nasi spolecnosti a podminkach spoluprace.\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
  { id: "t2", label: "Navrh smlouvy", subject: "Navrh smlouvy – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nzasilam Vam navrh smlouvy k prostudovani.\n\nZaroven Vas prosim o zaslani nasledujicich udaju potrebnych pro vyhotoveni finalni smlouvy:\n\n– Jmeno a prijmeni\n– Datum narozeni\n– Trvale bydliste\n– Vyse vkladu\n– Cislo bankovniho uctu\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
  { id: "t3", label: "Smlouva finalni", subject: "Smlouva – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nv priloze zasilam finalni verzi smlouvy k podpisu.\n\nProsim o prostudovani a zaslani podepsane verze zpet.\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR" },
  { id: "t4", label: "Mesicni vypis", subject: "Mesicni vypis – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nzasilam mesicni prehled k Vasi smlouve.\n\nPripsana castka: [CASTKA]\nCelkova vyse: [VKLAD]\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
  { id: "t5", label: "Follow-up", subject: "Navazuji na nas hovor – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nnavazuji na nas nedavny hovor. Rad/a bych domluvil/a dalsi krok.\n\nKdy by Vam vyhovovalo?\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
  { id: "t6", label: "Vyzadani udaju", subject: "Vyzadani udaju k podpisu smlouvy – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\ndekujeme za Vas zajem o spolupraci s Puskin and Partners. Abychom mohli pripravit smlouvu o zapujcce, potrebujeme od Vas nasledujici udaje:\n\n1. Cele jmeno a prijmeni\n2. Rodne cislo nebo datum narozeni\n3. Adresa trvaleho bydliste\n4. Bankovni spojeni\n5. Vyse vkladu\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
];

async function main() {
  console.log("=== Turso Push: Schema + Seed ===\n");

  // 1. Push schema
  console.log("1. Creating tables...");
  for (const sql of SCHEMA_STATEMENTS) {
    await db.execute(sql);
  }
  console.log(`   ${SCHEMA_STATEMENTS.length} statements executed.\n`);

  // 2. Seed users
  console.log("2. Seeding users...");
  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    await db.execute({
      sql: `INSERT OR REPLACE INTO "User" (id, firstName, lastName, email, password, role, active, signature, dailyLeadQuota, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, 150, datetime('now'))`,
      args: [u.id, u.firstName, u.lastName, u.email, hashed, u.role, u.signature],
    });
    console.log(`   ${u.firstName} ${u.lastName} (${u.role})`);
  }
  console.log();

  // 3. Seed email templates
  console.log("3. Seeding email templates...");
  for (const t of TEMPLATES) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO "EmailTemplate" (id, label, subject, body, allowedRoles) VALUES (?, ?, ?, ?, ?)`,
      args: [t.id, t.label, t.subject, t.body, t.allowedRoles],
    });
    console.log(`   ${t.label}`);
  }

  // Verify
  console.log("\n4. Verifying...");
  const userCount = await db.execute(`SELECT COUNT(*) as c FROM "User"`);
  const templateCount = await db.execute(`SELECT COUNT(*) as c FROM "EmailTemplate"`);
  console.log(`   Users: ${userCount.rows[0].c}`);
  console.log(`   Templates: ${templateCount.rows[0].c}`);

  console.log("\nDone! Schema pushed and seed data inserted.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  });
