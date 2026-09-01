import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const users = [
    { id: "u1", firstName: "Admin", lastName: "Puskin", email: "admin@puskinpartners.cz", password: "Puskin2026!", role: "ADMINISTRATOR" as const, signature: "S pozdravem,\nPuskin and Partners | Administrace\nwww.puskinpartners.cz" },
    { id: "u2", firstName: "Miroslav", lastName: "Fencl", email: "fencl@puskinpartners.cz", password: "Fencl123456", role: "ADMINISTRATOR" as const, signature: "S pozdravem,\nMiroslav Fencl | Puskin and Partners\nwww.puskinpartners.cz" },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, password: hashed, role: u.role, active: true, signature: u.signature },
    });
    console.log(`  User: ${u.firstName} ${u.lastName} (${u.role})`);
  }

  // --- Email Templates ---
  const templates = [
    { id: "t1", label: "Prezentace", subject: "Predstaveni spolecnosti – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nna zaklade naseho hovoru si Vam dovoluji zaslat prezentaci spolecnosti Puskin and Partners.\n\nV priloze naleznete podrobne informace o nasi spolecnosti a podminkach spoluprace.\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
    { id: "t2", label: "Navrh smlouvy", subject: "Navrh smlouvy – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nzasilam Vam navrh smlouvy k prostudovani.\n\nZaroven Vas prosim o zaslani nasledujicich udaju potrebnych pro vyhotoveni finalni smlouvy:\n\n– Jmeno a prijmeni\n– Datum narozeni\n– Trvale bydliste\n– Vyse vkladu\n– Cislo bankovniho uctu\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
    { id: "t3", label: "Smlouva finalni", subject: "Smlouva – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nv priloze zasilam finalni verzi smlouvy k podpisu.\n\nProsim o prostudovani a zaslani podepsane verze zpet.\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR" },
    { id: "t4", label: "Mesicni vypis", subject: "Mesicni vypis – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nzasilam mesicni prehled k Vasi smlouve.\n\nPripsana castka: [CASTKA]\nCelkova vyse: [VKLAD]\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
    { id: "t5", label: "Follow-up", subject: "Navazuji na nas hovor – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\nnavazuji na nas nedavny hovor. Rad/a bych domluvil/a dalsi krok.\n\nKdy by Vam vyhovovalo?\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
    { id: "t6", label: "Vyzadani udaju", subject: "Vyzadani udaju k podpisu smlouvy – Puskin and Partners", body: "Vazeny/a [OSLOVENI],\n\ndekujeme za Vas zajem o spolupraci s Puskin and Partners. Abychom mohli pripravit smlouvu o zapujcce, potrebujeme od Vas nasledujici udaje:\n\n1. Cele jmeno a prijmeni\n2. Rodne cislo nebo datum narozeni\n3. Adresa trvaleho bydliste\n4. Bankovni spojeni\n5. Vyse vkladu\n\n[PODPIS]", allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER" },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { id: t.id },
      update: { label: t.label, subject: t.subject, body: t.body, allowedRoles: t.allowedRoles },
      create: t,
    });
  }
  console.log("  Email templates seeded.");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
