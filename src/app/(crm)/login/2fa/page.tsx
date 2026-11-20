import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getPendingLogin, openSetupSecret } from "@/lib/crm/two-factor";
import { totpUri } from "@/lib/crm/totp";
import TwoFactorForm from "./two-factor-form";

export const dynamic = "force-dynamic";

export default async function TwoFactorPage() {
  const pending = await getPendingLogin();
  if (!pending) redirect("/login");

  let setup: { qr: string; secret: string; uri: string } | null = null;
  if (pending.setupSecret) {
    const secret = openSetupSecret(pending.setupSecret);
    const uri = totpUri(secret, pending.user.email);
    const qr = await QRCode.toDataURL(uri, {
      margin: 1,
      width: 220,
    });
    setup = { qr, uri, secret: secret.replace(/(.{4})/g, "$1 ").trim() };
  }

  return <TwoFactorForm firstName={pending.user.firstName} setup={setup} />;
}
