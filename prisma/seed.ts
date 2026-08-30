import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Czech realistic data ---
const FIRST_NAMES_M = [
  "Jan","Petr","Martin","Tomáš","Pavel","Jiří","Jakub","Miroslav","David","Lukáš",
  "Ondřej","Filip","Adam","Michal","Vojtěch","Daniel","Radek","Josef","Karel","Marek",
  "Stanislav","Vladimír","Roman","Zdeněk","Jaroslav","František","Aleš","Libor","Oldřich","Milan",
  "Václav","Robert","Richard","Kamil","Patrik","Dominik","Matěj","Štěpán","Vlastimil","Ivo",
  "Igor","René","Ladislav","Bohumil","Radomír","Dušan","Jindřich","Vratislav","Eduard","Hynek",
];
const FIRST_NAMES_F = [
  "Jana","Marie","Eva","Anna","Kateřina","Lucie","Petra","Hana","Tereza","Lenka",
  "Martina","Veronika","Monika","Alena","Simona","Jitka","Ivana","Pavla","Zuzana","Barbora",
  "Markéta","Michaela","Kristýna","Klára","Nikola","Gabriela","Denisa","Renáta","Dagmar","Blanka",
  "Daniela","Vendula","Radka","Šárka","Irena","Věra","Dana","Olga","Ludmila","Helena",
  "Božena","Růžena","Milena","Adéla","Nela","Eliška","Karolína","Natálie","Aneta","Soňa",
];
const LAST_NAMES_M = [
  "Novák","Svoboda","Novotný","Dvořák","Černý","Procházka","Kučera","Veselý","Horák","Němec",
  "Pokorný","Marek","Pospíšil","Hájek","Jelínek","Král","Růžička","Beneš","Fiala","Sedláček",
  "Doležal","Zeman","Kolář","Navrátil","Čermák","Vaněk","Urban","Blažek","Kříž","Kopecký",
  "Konečný","Malý","Holub","Šťastný","Kadlec","Bartoš","Vlček","Polák","Musil","Šimek",
  "Kratochvíl","Tichý","Hrubý","Kohout","Kolář","Šilhavý","Dostál","Sýkora","Vlk","Krejčí",
];
const LAST_NAMES_F = [
  "Nováková","Svobodová","Novotná","Dvořáková","Černá","Procházková","Kučerová","Veselá","Horáková","Němcová",
  "Pokorná","Marková","Pospíšilová","Hájková","Jelínková","Králová","Růžičková","Benešová","Fialová","Sedláčková",
  "Doležalová","Zemanová","Kolářová","Navrátilová","Čermáková","Vaňková","Urbanová","Blažková","Křížová","Kopecká",
  "Konečná","Malá","Holubová","Šťastná","Kadlecová","Bartošová","Vlčková","Poláková","Musilová","Šimková",
  "Kratochvílová","Tichá","Hrubá","Kohoutová","Kolářová","Šilhavá","Dostálová","Sýkorová","Vlková","Krejčová",
];
const STREETS = [
  "Vinohradská","Na Příkopě","Karlova","Hybernská","Spálená","Sokolská","Korunní","Italská",
  "Žitná","Ječná","Budečská","Blanická","Londýnská","Polská","Americká","Francouzská",
  "Ruská","Slovenská","Anglická","Belgická","Dánská","Jugoslávská","Rumunská","Uruguayská",
  "Záhřebská","Lublaňská","Bělehradská","Mánesova","Sázavská","Slavíkova","Seifertova",
  "Husitská","Táboritská","Kubelíkova","Ondříčkova","Roháčova","Jičínská","Prokopova",
  "Cimburkova","Bořivojova","Přemyslovská","Lucemburská","Lipanská","Biskupcova","Řipská",
  "Jaromírova","Svatoplukova","Na Slupi","Vyšehradská","Albertov","Horská","Nuselská",
  "Táborská","Bělocerkevská","Vršovická","Kodaňská","Moskevská","Bulharská","Finská",
];
const CITIES = [
  "Praha 1","Praha 2","Praha 3","Praha 4","Praha 5","Praha 6","Praha 7","Praha 8",
  "Praha 9","Praha 10","Brno","Plzeň","Ostrava","Liberec","Olomouc","České Budějovice",
  "Hradec Králové","Pardubice","Zlín","Kladno","Karlovy Vary","Mladá Boleslav",
];
const ZIPS = [
  "110 00","120 00","130 00","140 00","150 00","160 00","170 00","180 00",
  "190 00","100 00","602 00","301 00","700 30","460 01","779 00","370 01",
  "500 02","530 02","760 01","272 01","360 01","293 01",
];
const DOMAINS = ["seznam.cz","centrum.cz","email.cz","gmail.com","post.cz","volny.cz","atlas.cz","tiscali.cz"];
const SOURCES = ["web","referral","cold-call","event","linkedin","facebook","recommendation","database"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function czPhone(): string {
  const prefixes = ["601","602","603","604","605","606","607","608","609","720","721","722","723","724","725","730","731","732","733","734","735","736","737","770","771","772","773","774","775","776","777","778","779"];
  return `+420 ${pick(prefixes)} ${randInt(100,999)} ${randInt(100,999)}`;
}
function removeDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function generateContact(assignedTo: string, index: number) {
  const isFemale = Math.random() > 0.5;
  const firstName = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
  const lastName = isFemale ? pick(LAST_NAMES_F) : pick(LAST_NAMES_M);
  const emailBase = `${removeDiacritics(firstName)}.${removeDiacritics(lastName)}`;
  const emailSuffix = randInt(1, 999);
  const street = `${pick(STREETS)} ${randInt(1, 2500)}/${randInt(1, 80)}`;
  const cityIdx = randInt(0, CITIES.length - 1);

  return {
    id: `contact-${assignedTo}-${index}`,
    firstName,
    lastName,
    phone: czPhone(),
    email: `${emailBase}${emailSuffix}@${pick(DOMAINS)}`,
    birthDate: `${randInt(1955, 2000)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`,
    street,
    city: CITIES[cityIdx],
    zip: ZIPS[cityIdx] || "100 00",
    bankAccount: "",
    dnc: false,
    lastCallOutcome: "",
    lastCalledAt: "",
    callDate: "",
    nextPaymentDate: "",
    paymentFreq: 30,
    note: "",
    stage: "NEW",
    source: pick(SOURCES),
    metadata: "{}",
    assignedTo,
  };
}

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const users = [
    { id: "u1", firstName: "Admin", lastName: "Puskin", email: "admin@puskinpartners.cz", password: "Puskin2026!", role: "ADMINISTRATOR" as const, signature: "S pozdravem,\nPuskin and Partners | Administrace\nwww.puskinpartners.cz" },
    { id: "u2", firstName: "Miroslav", lastName: "Fencl", email: "fencl@puskinpartners.cz", password: "Fencl123456", role: "ADMINISTRATOR" as const, signature: "S pozdravem,\nMiroslav Fencl | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u3", firstName: "Tomáš", lastName: "Kříž", email: "kriz@puskinpartners.cz", password: "Broker2026!", role: "BROKER" as const, signature: "S pozdravem,\nTomáš Kříž | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u4", firstName: "Lukáš", lastName: "Horák", email: "horak@puskinpartners.cz", password: "Broker2026!", role: "BROKER" as const, signature: "S pozdravem,\nLukáš Horák | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u5", firstName: "Petra", lastName: "Dvořáková", email: "dvorakova@puskinpartners.cz", password: "Broker2026!", role: "BROKER" as const, signature: "S pozdravem,\nPetra Dvořáková | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u6", firstName: "Martin", lastName: "Veselý", email: "vesely@puskinpartners.cz", password: "Broker2026!", role: "BROKER" as const, signature: "S pozdravem,\nMartin Veselý | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u7", firstName: "Jana", lastName: "Procházková", email: "prochazkova@puskinpartners.cz", password: "Broker2026!", role: "SUPERVISOR" as const, signature: "S pozdravem,\nJana Procházková | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u8", firstName: "David", lastName: "Černý", email: "cerny@puskinpartners.cz", password: "Broker2026!", role: "BROKER" as const, signature: "S pozdravem,\nDavid Černý | Puskin and Partners\nwww.puskinpartners.cz" },
    { id: "u9", firstName: "Radek", lastName: "Šťastný", email: "stastny@puskinpartners.cz", password: "Broker2026!", role: "BROKER" as const, signature: "S pozdravem,\nRadek Šťastný | Puskin and Partners\nwww.puskinpartners.cz" },
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

  // --- Pool user ---
  const poolHash = await bcrypt.hash(Math.random().toString(36), 10);
  await prisma.user.upsert({
    where: { email: "pool@system.local" },
    update: {},
    create: { id: "u-pool", firstName: "Volny", lastName: "pool", email: "pool@system.local", password: poolHash, role: "BROKER", active: false, dailyLeadQuota: 0 },
  });
  console.log("  Pool user seeded.");

  // --- Contacts: 150 per broker/supervisor, 200 for pool ---
  const CONTACTS_PER_USER = 150;
  const brokerIds = ["u3","u4","u5","u6","u7","u8","u9"];
  let totalContacts = 0;

  for (const uid of brokerIds) {
    const contacts = Array.from({ length: CONTACTS_PER_USER }, (_, i) => generateContact(uid, i));
    for (const c of contacts) {
      await prisma.client.upsert({
        where: { id: c.id },
        update: {},
        create: c,
      });
    }
    totalContacts += CONTACTS_PER_USER;
    console.log(`  ${CONTACTS_PER_USER} contacts for user ${uid}`);
  }

  // Pool contacts
  const POOL_CONTACTS = 200;
  const poolContacts = Array.from({ length: POOL_CONTACTS }, (_, i) => generateContact("u-pool", i));
  for (const c of poolContacts) {
    await prisma.client.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }
  totalContacts += POOL_CONTACTS;
  console.log(`  ${POOL_CONTACTS} contacts for pool`);
  console.log(`  Total contacts: ${totalContacts}`);

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
