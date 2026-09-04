import { storageUrl } from "@/lib/content/media";
import type { SiteSettings } from "@/lib/content/queries";
import { ContactDetails } from "./contact-details";
import { ContactForm } from "./contact-form";
import { SiteFooter } from "./site-footer";

/**
 * The Contact stop on the deck (B2 item 7, B9) — the last one, and the finale.
 *
 * Two columns at width: the form on the left because it is what the section is for, the
 * details on the right because they are the answer for anyone who would rather not use a
 * form. The footer sits under both.
 *
 * The email address is split before it reaches the client so the joined string never
 * appears in the served HTML (B9). It is reassembled in the browser.
 */
export function ContactSection({ settings }: { settings: SiteSettings | null }) {
  const email = settings?.email ?? null;
  const [emailUser, emailDomain] = email ? email.split("@") : [null, null];
  const socials = (settings?.socials as Record<string, string> | null) ?? {};
  const cvUrl = storageUrl("documents", settings?.cv_path);

  return (
    <div className="section-body contact" data-inner-scroll>
      <div className="contact__body">
        <div className="contact__form">
          <p className="section-intro text-body text-ink measure">
            Tell me what you&rsquo;re building, or what you need built.
          </p>
          <ContactForm email={email} />
        </div>

        <ContactDetails
          emailUser={emailUser ?? null}
          emailDomain={emailDomain ?? null}
          availability={settings?.availability ?? null}
          timezone={settings?.timezone ?? "Asia/Qatar"}
          linkedin={socials.linkedin ?? null}
          github={socials.github ?? null}
          cvUrl={cvUrl}
        />
      </div>

      <SiteFooter />
    </div>
  );
}
