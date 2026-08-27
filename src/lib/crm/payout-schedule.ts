export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export interface PayoutEvent {
  date: string;
  amount: number;
  days: number;
  label: string;
}

export interface ComputePayoutsInput {
  startDate: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  payoutFrequency: "monthly" | "quarterly";
}

export function computePayoutSchedule(input: ComputePayoutsInput): PayoutEvent[] {
  const { startDate, amount, interestRate, durationMonths, payoutFrequency } = input;
  if (!amount || !interestRate || !durationMonths) return [];

  const annual = amount * (interestRate / 100);
  const dailyRate = annual / 365;
  const stepMonths = payoutFrequency === "quarterly" ? 3 : 1;

  const start = new Date(`${startDate}T12:00:00`);
  const contractEnd = new Date(start);
  contractEnd.setMonth(contractEnd.getMonth() + durationMonths);

  const firstPayout = new Date(start.getFullYear(), start.getMonth(), 15, 12, 0, 0);
  if (firstPayout < start) {
    firstPayout.setMonth(firstPayout.getMonth() + stepMonths);
  }

  const regular: Date[] = [];
  for (
    let d = new Date(firstPayout);
    d <= contractEnd;
    d = new Date(d.getFullYear(), d.getMonth() + stepMonths, 15, 12, 0, 0)
  ) {
    regular.push(d);
  }

  while (regular.length > 0) {
    const last = regular[regular.length - 1];
    const daysToEnd = Math.round(
      (contractEnd.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysToEnd < 7) {
      regular.pop();
    } else {
      break;
    }
  }

  const dates = [...regular];
  const lastRegular = regular[regular.length - 1];
  if (!lastRegular || formatLocalDate(lastRegular) !== formatLocalDate(contractEnd)) {
    dates.push(contractEnd);
  }

  const totalDays = Math.round((contractEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalProfit = Math.round(totalDays * dailyRate);

  const events: PayoutEvent[] = [];
  let prev = start;
  let sumSoFar = 0;
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const days = Math.round((d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    const isLast = i === dates.length - 1;

    let amountCzk: number;
    if (isLast) {
      amountCzk = totalProfit - sumSoFar;
    } else {
      amountCzk = Math.round(days * dailyRate);
      sumSoFar += amountCzk;
    }

    const isFirst = i === 0;
    const label = isFirst
      ? `Prvni (pomerna) — ${days} dni`
      : isLast
      ? `Zaverecna dorovnavaci — ${days} dni`
      : `Splatka ${i + 1}/${dates.length} — ${days} dni`;

    events.push({
      date: formatLocalDate(d),
      amount: amountCzk,
      days,
      label,
    });
    prev = d;
  }

  return events;
}
