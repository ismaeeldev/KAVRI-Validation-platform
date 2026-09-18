import type { PublicUpdateDTO } from "@/server/services/public-queries-service";
import { wrap, sectionPadding, eyebrow, sectionHead, sectionHeadP, deviceCorner, pillBase, pillNeutral, cx } from "./held-charge-shared";

interface HeldChargeDevelopmentLogProps {
  updates: PublicUpdateDTO[];
}

/**
 * The small trend-line graphic shown behind each log entry's header,
 * ported unchanged from the client-provided design.
 */
function LogEntryArt() {
  return (
    <div className="h-[156px] relative bg-[#0D0F14]">
      <svg viewBox="0 0 300 156" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <rect width="300" height="156" fill="#0D0F14" />
        <g stroke="#23262F" strokeWidth={1}>
          <path d="M0 20h300M0 50h300M0 80h300M0 110h300M0 140h300" />
          <path d="M40 0v156M100 0v156M160 0v156M220 0v156M260 0v156" />
        </g>
        <path d="M20 78h260" stroke="#5268C9" strokeWidth={0.7} strokeDasharray="2 3" opacity={0.45} />
        <path d="M20,78 Q55,32 90,78 T160,78 T230,78 T280,78" fill="none" stroke="#5268C9" strokeWidth={1.6} />
        <g fill="#5268C9">
          <circle cx="90" cy="78" r="2.4" />
          <circle cx="160" cy="78" r="2.4" />
          <circle cx="230" cy="78" r="2.4" />
        </g>
      </svg>
    </div>
  );
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

interface LogEntryProps {
  statusLabel: string;
  title: string;
  summary: string;
  publishedAt: Date | null;
}

function LogEntry({ statusLabel, title, summary, publishedAt }: LogEntryProps) {
  return (
    <article className="flex-1 bg-[var(--kv-night)] rounded-[10px] overflow-hidden text-[var(--kv-night-text)] flex flex-col border border-[var(--kv-night-line)]">
      <LogEntryArt />
      <div className="pt-5 px-[22px] pb-6 flex flex-col gap-[9px]">
        <div className="flex gap-2 items-center">
          <span className={cx(pillBase, pillNeutral)}>{statusLabel}</span>
          {publishedAt && (
            <span className="font-mono text-[10.5px] text-[var(--kv-night-text-soft)]">
              {DATE_FORMATTER.format(publishedAt)}
            </span>
          )}
        </div>
        <h4 className="text-[15px] font-bold">{title}</h4>
        <p className="text-[13.5px] text-[var(--kv-night-text-soft)] font-sans">{summary}</p>
      </div>
    </article>
  );
}

export function HeldChargeDevelopmentLog({ updates }: HeldChargeDevelopmentLogProps) {
  return (
    <section id="log" className={cx("bg-[var(--kv-paper)]", sectionPadding)}>
      <div className={wrap}>
        <div className={sectionHead}>
          <div className="inline-flex items-center gap-[11px]">
            <span className={eyebrow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-3 h-3 flex-none">
                <use href="#i-log" />
              </svg>
              THE LOG
            </span>
            <svg viewBox="0 0 370 282" aria-hidden="true" className={deviceCorner}>
              <use href="#mk-02C" />
            </svg>
          </div>
          <h2 className="font-heading text-[clamp(28px,3.6vw,42px)]">Development log</h2>
          <p className={sectionHeadP}>
            A public record of selected tests, decisions, and changes KAVRI is ready to share.
          </p>
        </div>

        <div className="flex gap-5 flex-wrap max-[900px]:flex-col">
          {updates.length > 0 ? (
            updates.map((update) => (
              <LogEntry
                key={update.id}
                statusLabel={update.statusLabel}
                title={update.title}
                summary={update.summary}
                publishedAt={update.publishedAt}
              />
            ))
          ) : (
            <LogEntry
              statusLabel="Introduction"
              title="Why KAVRI is building in public"
              summary="KAVRI is documenting the development of its first paddle. Future entries will share approved progress, open questions, and decisions as testing continues."
              publishedAt={null}
            />
          )}
        </div>
      </div>
    </section>
  );
}
