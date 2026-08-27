import crypto from "crypto";

const secret = () => process.env.SESSION_SECRET || "";

export function generateUnsubscribeToken(clientId: string): string {
  const sec = secret();
  if (!sec) throw new Error("SESSION_SECRET missing");
  const hmac = crypto.createHmac("sha256", sec).update(clientId).digest("hex");
  const payload = `${clientId}:${hmac}`;
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const sec = secret();
    if (!sec) return null;
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [clientId, hmac] = decoded.split(":");
    if (!clientId || !hmac) return null;
    const expected = crypto.createHmac("sha256", sec).update(clientId).digest("hex");
    const a = Buffer.from(hmac, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;
    return clientId;
  } catch {
    return null;
  }
}

export function buildUnsubscribeUrl(clientId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://puskinpartners.cz";
  return `${base}/api/unsubscribe?t=${generateUnsubscribeToken(clientId)}`;
}
