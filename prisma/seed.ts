import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Puskin2026!", 10);
  await prisma.user.upsert({
    where: { email: "admin@puskinpartners.cz" },
    update: {},
    create: {
      id: "u1",
      firstName: "Admin",
      lastName: "Puskin",
      email: "admin@puskinpartners.cz",
      password: adminPassword,
      role: "ADMINISTRATOR",
      active: true,
      signature:
        "S pozdravem,\nPuskin and Partners | Administrace\nwww.puskinpartners.cz",
    },
  });
  console.log("  Admin user seeded.");

  // Lukas user
  const lukasPassword = await bcrypt.hash("Lukas123456", 10);
  await prisma.user.upsert({
    where: { email: "lukas@puskinpartners.cz" },
    update: {},
    create: {
      id: "u2",
      firstName: "Lukas",
      lastName: "Salamanek",
      email: "lukas@puskinpartners.cz",
      password: lukasPassword,
      role: "ADMINISTRATOR",
      active: true,
      signature:
        "S pozdravem,\nLukas Salamanek | Puskin and Partners\nwww.puskinpartners.cz",
    },
  });
  console.log("  Lukas user seeded.");

  // Email Templates
  const templates = [
    {
      id: "t1",
      label: "Prezentace",
      subject: "Predstaveni spolecnosti – Puskin and Partners",
      body: "Vazeny/a [OSLOVENI],\n\nna zaklade naseho hovoru si Vam dovoluji zaslat prezentaci spolecnosti Puskin and Partners.\n\nV priloze naleznete podrobne informace o nasi spolecnosti a podminkach spoluprace.\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t2",
      label: "Navrh smlouvy",
      subject: "Navrh smlouvy – Puskin and Partners",
      body: "Vazeny/a [OSLOVENI],\n\nzasilam Vam navrh smlouvy k prostudovani.\n\nZaroven Vas prosim o zaslani nasledujicich udaju potrebnych pro vyhotoveni finalni smlouvy:\n\n– Jmeno a prijmeni\n– Datum narozeni\n– Trvale bydliste\n– Vyse vkladu (jakou castku chcete investovat)\n– Cislo bankovniho uctu\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t3",
      label: "Smlouva finalni",
      subject: "Smlouva – Puskin and Partners",
      body: "Vazeny/a [OSLOVENI],\n\nv priloze zasilam finalni verzi smlouvy k podpisu.\n\nProsim o prostudovani a zaslani podepsane verze zpet.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR",
    },
    {
      id: "t4",
      label: "Mesicni vypis",
      subject: "Mesicni vypis – Puskin and Partners",
      body: "Vazeny/a [OSLOVENI],\n\nzasilam mesicni prehled k Vasi smlouve.\n\nPripsana castka: [CASTKA]\nCelkova vyse: [VKLAD]\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t5",
      label: "Follow-up",
      subject: "Navazuji na nas hovor – Puskin and Partners",
      body: "Vazeny/a [OSLOVENI],\n\nnavazuji na nas nedavny hovor. Rad/a bych domluvil/a schuzku.\n\nKdy by Vam vyhovovalo?\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t6",
      label: "Vyzadani udaju",
      subject: "Vyzadani udaju k podpisu smlouvy – Puskin and Partners",
      body: "Vazeny/a [OSLOVENI],\n\ndekujeme za Vas zajem o spolupraci s Puskin and Partners. Abychom mohli pripravit smlouvu o zapujcce, potrebujeme od Vas nasledujici udaje:\n\n1. Cele jmeno a prijmeni\n2. Rodne cislo nebo datum narozeni\n3. Adresa trvaleho bydliste\n4. Bankovni spojeni (cislo uctu a kod banky)\n5. Vyse vkladu (castka, kterou chcete investovat)\n\nUdaje nam prosim zaslete odpovedi na tento email nebo je sdelte telefonicky.\n\nVase osobni udaje budou pouzity vyhradne pro ucely smluvniho vztahu a budou zpracovany v souladu s GDPR.\n\nDekujeme a tesime se na spolupraci.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
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
