"use client";
import { useActionState, useState } from "react";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactForm() {
  const [agreed, setAgreed] = useState(false);
  const [state, formAction, isPending] = useActionState(submitContactForm, {
    success: false,
    error: null,
  });

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-8 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Zpráva odeslána</h3>
        <p className="text-green-700">
          Děkujeme za Vaši zprávu. Ozveme se Vám co nejdříve.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
          Jméno a příjmení *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
          E-mail *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
          Telefon
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">
          Předmět *
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Vyberte předmět</option>
          <option value="obecny">Obecný dotaz</option>
          <option value="development">Development</option>
          <option value="rekonstrukce">Rekonstrukce</option>
          <option value="nemovitosti">Nemovitosti</option>
          <option value="investice">Investice</option>
          <option value="kariera">Kariéra</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
          Zpráva *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="gdpr"
          value="yes"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 rounded border-neutral-300 text-primary-800 focus:ring-primary-500"
        />
        <span className="text-sm text-neutral-600">
          Souhlasím se zpracováním osobních údajů za účelem vyřízení mého dotazu. *
        </span>
      </label>
      <button
        type="submit"
        disabled={!agreed || isPending}
        className="w-full px-8 py-4 bg-primary-800 text-white font-medium rounded-md hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Odesílám..." : "Odeslat zprávu"}
      </button>
    </form>
  );
}
