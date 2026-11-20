"use client";

import { useActionState } from "react";
import Link from "next/link";
import { verifyTwoFactor } from "@/app/actions/crm/auth";

export default function TwoFactorForm({
  firstName,
  setup,
}: {
  firstName: string;
  setup: { qr: string; secret: string } | null;
}) {
  const [state, action, pending] = useActionState(verifyTwoFactor, undefined);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-ink">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="font-heading text-3xl text-on-dark tracking-[.2em] uppercase">PUSKIN</div>
          <div className="text-[11px] text-brass tracking-[.35em] uppercase font-medium mt-1">PARTNERS</div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-on-dark/40 font-medium">
            Ověření přihlášení
          </p>
        </div>

        <div className="bg-[rgba(239,234,225,0.06)] border border-[rgba(239,234,225,0.1)] p-6 md:p-8">
          {setup ? (
            <div className="mb-6 text-sm text-on-dark/70 space-y-3">
              <p>
                {firstName}, přihlášení do CRM je chráněné kódem z mobilu. Nastavíte ho jen jednou:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Nainstalujte si aplikaci <strong>Google Authenticator</strong> (nebo Microsoft Authenticator).</li>
                <li>V aplikaci zvolte <strong>+</strong> → <strong>Naskenovat QR kód</strong>.</li>
                <li>Opište 6místný kód, který aplikace ukáže.</li>
              </ol>
              <div className="flex justify-center py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setup.qr} alt="QR kód pro Google Authenticator" width={220} height={220} className="bg-white p-2" />
              </div>
              <p className="text-xs text-on-dark/40 text-center">
                Nejde naskenovat? Zadejte v aplikaci ručně klíč:
                <br />
                <code className="text-on-dark/70 tracking-wider select-all">{setup.secret}</code>
              </p>
            </div>
          ) : (
            <p className="mb-6 text-sm text-on-dark/70">
              Zadejte 6místný kód z aplikace Google Authenticator.
            </p>
          )}

          <form action={action}>
            <label htmlFor="code" className="block text-sm font-medium text-on-dark/60 mb-1.5">
              Kód z aplikace
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              required
              autoFocus
              className="w-full h-12 px-3.5 mb-4 bg-[rgba(239,234,225,0.07)] border border-[rgba(239,234,225,0.12)] text-on-dark text-center text-xl tracking-[0.4em] outline-none focus:border-brass"
              placeholder="000000"
            />

            {state?.error && (
              <div className="mb-4 text-sm text-ruby text-center font-medium">{state.error}</div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full h-12 bg-brass text-paper font-semibold text-sm tracking-wide transition-all hover:bg-brass-dark disabled:opacity-60 flex items-center justify-center"
            >
              {pending ? (
                <span className="inline-block w-5 h-5 border-2 border-paper/30 border-t-paper animate-spin" />
              ) : (
                <>Ověřit &rarr;</>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-on-dark/40">
            <Link href="/login" className="hover:text-on-dark/70">Zpět na přihlášení</Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-on-dark/30">
          Ztracený telefon? Požádejte administrátora o obnovení ověření.
        </p>
      </div>
    </div>
  );
}
