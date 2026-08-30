import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { redirect } from "next/navigation";

export default async function PrintContactsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isBroker = session.role === "broker";

  const clients = await prisma.client.findMany({
    where: isBroker ? { assignedTo: session.id, dnc: false } : undefined,
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ assignedTo: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  // Group by broker
  const grouped = new Map<string, typeof clients>();
  for (const c of clients) {
    const key = `${c.user.firstName} ${c.user.lastName}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  return (
    <html>
      <head>
        <title>Kontakty k tisku — Puskin and Partners</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @page {
            size: A4 landscape;
            margin: 12mm 10mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10px;
            color: #1a1a1a;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 12px 0;
            border-bottom: 2px solid #16211D;
            margin-bottom: 8px;
          }
          .header h1 {
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .header .date {
            font-size: 10px;
            color: #666;
          }
          .broker-section {
            page-break-inside: avoid;
            margin-bottom: 16px;
          }
          .broker-name {
            font-size: 12px;
            font-weight: 600;
            background: #16211D;
            color: #F2EEE6;
            padding: 4px 10px;
            margin-bottom: 2px;
          }
          .broker-count {
            font-weight: 400;
            color: #A9884E;
            margin-left: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
          }
          thead th {
            background: #f5f3ef;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 7.5px;
            padding: 4px 6px;
            text-align: left;
            border-bottom: 1px solid #ccc;
            white-space: nowrap;
          }
          tbody td {
            padding: 3px 6px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
          }
          tbody tr:nth-child(even) { background: #fafaf8; }
          .col-num { width: 24px; text-align: right; color: #999; }
          .col-name { font-weight: 500; white-space: nowrap; }
          .col-phone { white-space: nowrap; font-family: 'Courier New', monospace; font-size: 9px; }
          .col-email { font-size: 8.5px; color: #444; }
          .col-addr { font-size: 8.5px; color: #555; max-width: 200px; }
          .col-source { font-size: 8px; color: #888; text-transform: uppercase; }
          .col-notes {
            width: 100px;
            border-bottom: 1px dotted #ccc;
          }
          .footer {
            margin-top: 16px;
            padding-top: 8px;
            border-top: 1px solid #ddd;
            font-size: 8px;
            color: #999;
            text-align: center;
          }
          @media screen {
            body { padding: 24px; max-width: 1200px; margin: 0 auto; }
            .no-print { display: block; }
          }
          @media print {
            .no-print { display: none !important; }
          }
          .print-btn {
            display: inline-block;
            background: #16211D;
            color: #F2EEE6;
            border: none;
            padding: 10px 24px;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            margin-bottom: 16px;
          }
          .print-btn:hover { background: #0E1614; }
        `}} />
      </head>
      <body>
        <div className="no-print">
          <button className="print-btn" id="print-btn">TISKNOUT</button>
          <script dangerouslySetInnerHTML={{ __html: `document.getElementById('print-btn').addEventListener('click',function(){window.print()})` }} />
        </div>

        <div className="header">
          <h1>PUSKIN PARTNERS — Kontakty</h1>
          <span className="date">{new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        {Array.from(grouped.entries()).map(([brokerName, brokerClients]) => (
          <div key={brokerName} className="broker-section">
            <div className="broker-name">
              {brokerName}
              <span className="broker-count">{brokerClients.length} kontaktů</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th>Jméno</th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>Adresa</th>
                  <th>Zdroj</th>
                  <th className="col-notes">Poznámky</th>
                </tr>
              </thead>
              <tbody>
                {brokerClients.map((c, i) => (
                  <tr key={c.id}>
                    <td className="col-num">{i + 1}</td>
                    <td className="col-name">{c.lastName} {c.firstName}</td>
                    <td className="col-phone">{c.phone}</td>
                    <td className="col-email">{c.email}</td>
                    <td className="col-addr">{c.street}{c.city ? `, ${c.city}` : ""}{c.zip ? ` ${c.zip}` : ""}</td>
                    <td className="col-source">{c.source}</td>
                    <td className="col-notes"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="footer">
          Puskin and Partners · Vygenerováno {new Date().toLocaleDateString("cs-CZ")} · Důvěrné — pouze pro interní použití
        </div>
      </body>
    </html>
  );
}
