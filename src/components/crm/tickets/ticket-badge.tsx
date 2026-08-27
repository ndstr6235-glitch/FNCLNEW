"use client";

import { useState, useEffect, useTransition } from "react";
import { getOpenTicketCount } from "@/app/actions/crm/tickets";

export default function TicketBadge() {
  const [count, setCount] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function fetch() {
      const n = await getOpenTicketCount();
      setCount(n);
    }
    startTransition(() => { fetch(); });
    const iv = setInterval(() => { startTransition(() => { fetch(); }); }, 60000);
    return () => clearInterval(iv);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-ruby text-white text-[10px] font-bold">
      {count > 9 ? "9+" : count}
    </span>
  );
}
