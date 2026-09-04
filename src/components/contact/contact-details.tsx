"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/components/ui/link";
import { Toast } from "@/components/ui/toast";
import { SlideToOpen } from "./slide-to-open";

/**
 * Everything beside the form: the address, the local time, the socials, the slider.
 *
 * The email address is assembled in the browser rather than written into the HTML (B9).
 * A scraper reading the served markup finds two halves and a class name; a person clicks
 * "Copy email" and gets the address. It is a small measure and it does not stop a
 * determined crawler, but the cheap ones read HTML and never run JavaScript.
 */

type Props = {
  /** Split so the joined address never appears in the server-rendered markup. */
  emailUser: string | null;
  emailDomain: string | null;
  availability: string | null;
  timezone: string;
  linkedin: string | null;
  github: string | null;
  cvUrl: string | null;
};

/** "It's 14:32 for me" — B9's wording, in Fadi's zone rather than the visitor's. */
function LocalTime({ timezone }: { timezone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone,
        }).format(new Date()),
      );

    read();
    // Ticks on the minute rather than every second: nothing here changes faster, and a
    // second hand on a contact page is a thing that moves for no reason.
    const timer = window.setInterval(read, 30_000);
    return () => window.clearInterval(timer);
  }, [timezone]);

  // Rendered only once the client knows the time. On the server it would be the build
  // machine's clock, which is nobody's.
  if (!time) return null;

  return (
    <p className="text-small text-muted">
      It&rsquo;s <span className="text-data text-ink">{time}</span> for me.
    </p>
  );
}

export function ContactDetails({
  emailUser,
  emailDomain,
  availability,
  timezone,
  linkedin,
  github,
  cvUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const email = emailUser && emailDomain ? `${emailUser}@${emailDomain}` : null;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard refused — an insecure context, or a browser that asks. Showing the
      // address is the fallback, so the visitor can select it by hand.
      setRevealed(true);
    }
  };

  return (
    <div className="contact-details">
      {availability ? <p className="text-body text-ink measure">{availability}</p> : null}

      <LocalTime timezone={timezone} />

      {email ? (
        <div className="contact-details__email">
          <button type="button" className="contact-copy" onClick={copy}>
            {copied ? (
              <Check size={18} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Copy size={18} strokeWidth={1.5} aria-hidden="true" />
            )}
            <span className="text-small">{copied ? "Copied" : "Copy email"}</span>
          </button>

          {revealed ? <p className="text-small text-ink">{email}</p> : null}

          {copied ? (
            <Toast tone="success" className="contact-details__toast">
              Copied
            </Toast>
          ) : null}
        </div>
      ) : null}

      <ul className="contact-details__links">
        {linkedin ? (
          <li>
            <Link href={linkedin} external className="text-small">
              LinkedIn
            </Link>
          </li>
        ) : null}
        {github ? (
          <li>
            <Link href={github} external className="text-small">
              GitHub
            </Link>
          </li>
        ) : null}
        {cvUrl ? (
          <li>
            <Link href={cvUrl} external className="text-small">
              CV
            </Link>
          </li>
        ) : null}
      </ul>

      {/* The last call to action on the site (B7). */}
      {linkedin ? <SlideToOpen href={linkedin} target="LinkedIn" /> : null}
    </div>
  );
}
