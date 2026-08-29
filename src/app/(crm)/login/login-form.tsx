"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/crm/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-ink">
      <div className="w-full max-w-[420px]">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 text-center">
            <div className="font-heading text-3xl text-on-dark tracking-[.2em] uppercase">PUSKIN</div>
            <div className="text-[11px] text-brass tracking-[.35em] uppercase font-medium mt-1">PARTNERS</div>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-on-dark/40 font-medium">
            Prihlaseni do systemu
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[rgba(239,234,225,0.06)] border border-[rgba(239,234,225,0.1)] p-6 md:p-8">
          <form action={action}>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-dark/60 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-3.5 bg-[rgba(239,234,225,0.07)] border border-[rgba(239,234,225,0.12)] text-on-dark placeholder-on-dark/30 text-sm outline-none transition-colors focus:border-brass focus:bg-[rgba(239,234,225,0.1)]"
                placeholder="vas@email.cz"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-dark/60 mb-1.5"
              >
                Heslo
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-3.5 pr-11 bg-[rgba(239,234,225,0.07)] border border-[rgba(239,234,225,0.12)] text-on-dark placeholder-on-dark/30 text-sm outline-none transition-colors focus:border-brass focus:bg-[rgba(239,234,225,0.1)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-dark/40 hover:text-on-dark/70 transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? "Skryt" : "Zobrazit"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {state?.error && (
              <div className="mb-4 text-sm text-ruby text-center font-medium">
                {state.error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full h-12 bg-brass text-paper font-semibold text-sm tracking-wide transition-all hover:bg-brass-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pending ? (
                <span className="inline-block w-5 h-5 border-2 border-paper/30 border-t-paper animate-spin" />
              ) : (
                <>Prihlasit se &rarr;</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-on-dark/20">
          Puskin and Partners &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
