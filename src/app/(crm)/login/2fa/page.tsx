import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getPendingLogin, openSetupSecret } from "@/lib/crm/two-factor";
import { totpUri } from "@/lib/crm/totp";
import TwoFactorForm from "./two-factor-form";

export const dynamic = "force-dynamic";

export default async function TwoFactorPage() {
  const pending = await getPendingLogin();
  if (!pending) redirect("/login");

  let setup: { qr: string; secret: string } | null = null;
  if (pending.setupSecret) {
    const secret = openSetupSecret(pending.setupSecret);
    const qr = await QRCode.toDataURL(totpUri(secret, pending.user.email), {
      margin: 1,
      width: 220,
    });
    setup = { qr, secret: secret.replace(/(.{4})/g, "$1 ").trim() };
  }

  return <TwoFactorForm firstName={pending.user.firstName} setup={setup} />;
}
