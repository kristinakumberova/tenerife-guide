import { CheckCircle2, LockKeyhole } from "lucide-react";

interface QuickInfoCardProps {
  title: string;
  summary: string;
  status?: "neutral" | "contact-required";
}

export function QuickInfoCard({ title, summary, status = "neutral" }: QuickInfoCardProps) {
  const Icon = status === "contact-required" ? LockKeyhole : CheckCircle2;
  return (
    <article className={`quick-card ${status === "contact-required" ? "quick-card-warn" : ""}`}>
      <Icon size={20} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{summary}</p>
      </div>
    </article>
  );
}
