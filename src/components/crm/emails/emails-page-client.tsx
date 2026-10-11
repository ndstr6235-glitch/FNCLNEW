"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import ClientEmailCard from "./client-email-card";
import EmailComposer from "./email-composer";
import EmailsEmpty from "./emails-empty";
import type { Role } from "@/lib/crm/types";

export interface EmailClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isInvestor: boolean;
  totalDeposit: number;
  note: string;
  brokerName: string;
}

export interface EmailTemplateRow {
  id: string;
  label: string;
  subject: string;
  body: string;
  allowedRoles: string[];
}

interface EmailsPageClientProps {
  clients: EmailClientRow[];
  templates: EmailTemplateRow[];
  userRole: Role;
  userName?: string;
  userEmail?: string;
}

interface ComposerState {
  client: EmailClientRow;
  templateId: string;
}

export default function EmailsPageClient({
  clients,
  templates,
  userRole,
  userName,
  userEmail,
}: EmailsPageClientProps) {
  const [composerState, setComposerState] = useState<ComposerState | null>(
    null
  );

  function handleSelectTemplate(clientId: string, templateId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setComposerState({ client, templateId });
  }

  function handleCloseComposer() {
    setComposerState(null);
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            Emaily
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            {clients.length}{" "}
            {clients.length === 1
              ? "klient"
              : clients.length < 5
                ? "klienti"
                : "klientů"}
          </p>
        </div>
        {userRole !== "broker" && (
          <Link
            href="/emails/sent"
            className="flex items-center gap-2 px-4 py-2.5 border border-border bg-surface text-text text-sm font-semibold hover:bg-surface-hover"
          >
            <MailCheck size={16} />
            <span className="hidden sm:inline">Oslovení e-mailem</span>
          </Link>
        )}
      </div>

      {/* Content */}
      {clients.length === 0 ? (
        <EmailsEmpty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientEmailCard
              key={client.id}
              client={client}
              templates={templates}
              onSelectTemplate={handleSelectTemplate}
            />
          ))}
        </div>
      )}

      {/* Email Composer */}
      {composerState && (
        <EmailComposer
          open
          onClose={handleCloseComposer}
          clientName={`${composerState.client.firstName} ${composerState.client.lastName}`}
          clientEmail={composerState.client.email}
          totalDeposit={composerState.client.totalDeposit}
          templates={templates}
          userRole={userRole}
          initialTemplateId={composerState.templateId}
          clientNote={composerState.client.note}
          brokerName={composerState.client.brokerName}
          clientId={composerState.client.id}
          prefillFirstName={composerState.client.firstName}
          prefillLastName={composerState.client.lastName}
          clientPhone={composerState.client.phone}
          userName={userName}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
