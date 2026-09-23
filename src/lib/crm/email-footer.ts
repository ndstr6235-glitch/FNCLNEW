/**
 * Shared footer for outgoing client e-mails.
 *
 * The unsubscribe link is rendered as a small button — a raw token URL in the
 * body looks like spam and wraps across several lines in most mail clients.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Footer markup with the unsubscribe button. */
export function unsubscribeFooterHtml(unsubUrl: string): string {
  return `<div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e0d8;text-align:center">
  <p style="margin:0 0 10px;font-size:11px;color:#8a8478;font-family:Arial,Helvetica,sans-serif">
    Nepřejete si dostávat další zprávy?
  </p>
  <a href="${escapeHtml(unsubUrl)}"
     style="display:inline-block;padding:8px 18px;border:1px solid #c9c2b6;border-radius:2px;font-size:11px;font-family:Arial,Helvetica,sans-serif;color:#6b6459;text-decoration:none">
    Odhlásit se z e-mailů
  </a>
</div>`;
}

/**
 * Wraps a plain-text e-mail body in simple HTML and appends the unsubscribe
 * button. Line breaks are preserved.
 */
export function plainBodyToHtml(body: string, unsubUrl?: string): string {
  const paragraphs = escapeHtml(body)
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 14px">${block.replace(/\n/g, "<br>")}</p>`
    )
    .join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#ffffff">
<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#2b2b2b">
${paragraphs}
${unsubUrl ? unsubscribeFooterHtml(unsubUrl) : ""}
</div>
</body></html>`;
}

/** Plain-text counterpart — kept short so the URL does not dominate the mail. */
export function plainBodyWithFooter(body: string, unsubUrl?: string): string {
  if (!unsubUrl) return body;
  return `${body}\n\n---\nOdhlášení z e-mailů: ${unsubUrl}`;
}
