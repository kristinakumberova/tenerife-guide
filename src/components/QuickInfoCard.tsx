import { CheckCircle2, LockKeyhole } from "lucide-react";

interface QuickInfoCardProps {
  title: string;
  summary: string;
  status?: "neutral" | "contact-required";
  href?: string;
}

export function QuickInfoCard({ title, summary, status = "neutral", href }: QuickInfoCardProps) {
  const Icon = status === "contact-required" ? LockKeyhole : CheckCircle2;
  const content = href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {summary}
    </a>
  ) : (
    summary
  );

  return (
    <article className={`quick-card ${status === "contact-required" ? "quick-card-warn" : ""}`}>
      <Icon size={20} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{content}</p>
      </div>
    </article>
  );
}
