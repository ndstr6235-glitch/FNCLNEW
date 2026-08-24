"use client";
import { useState } from "react";
import { Section, Container } from "@/components/ui";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
  };

  return (
    <Section background="primary">
      <Container size="md">
        <div className="text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Newsletter
          </h2>
          <p className="text-primary-200 max-w-xl mx-auto mb-8">
            Nové projekty, investiční příležitosti a aktuality z pražského realitního trhu.
            Jednou měsíčně, bez spamu.
          </p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Váš e-mail"
                required
                className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!agreed}
                className="px-6 py-3 bg-accent-500 text-white font-medium rounded-md hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Odebírat
              </button>
            </div>
            <label className="flex items-start gap-2 mt-4 text-left cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-white/30 bg-white/10 text-accent-500 focus:ring-accent-400"
              />
              <span className="text-sm text-primary-300">
                Souhlasím se zpracováním osobních údajů za účelem zasílání newsletteru.
              </span>
            </label>
          </form>
        </div>
      </Container>
    </Section>
  );
}
