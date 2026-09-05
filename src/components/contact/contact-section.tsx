import dynamic from "next/dynamic";
import { storageUrl } from "@/lib/content/media";
import type { SiteSettings } from "@/lib/content/queries";
import { SiteFooter } from "./site-footer";

/*
 * The two interactive halves of this section are imported lazily, and the reason is
 * measured rather than assumed.
 *
 * Contact is the seventh stop of seven, and the deck only mounts a section when it is
 * active or next — so this markup does not render on a visit that never gets here, and
 * its JavaScript was being parsed on every visit anyway. The form's chunk carries zod,
 * because the validation rules are shared with the server so the two cannot drift; that
 * is the right call and the wrong thing to put on the critical path of a page most
 * visitors leave from the hero.
 *
 * Lighthouse measured the home page's Largest Contentful Paint at 3.8s with 88% of it
 * spent in render delay — the browser holding finished content while the main thread
 * parsed script. This is that script.
 *
 * Nothing about the behaviour changes: the chunk is fetched when the section mounts,
 * which is exactly when it was previously rendered from code already in the bundle.
 */
const ContactForm = dynamic(() => import("./contact-form").then((m) => m.ContactForm));
const ContactDetails = dynamic(() => import("./contact-details").then((m) => m.ContactDetails));

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
  const [emailUser, emailDomain] = settings?.email ? settings.email.split("@") : [null, null];
  const socials = (settings?.socials as Record<string, string> | null) ?? {};
  const cvUrl = storageUrl("documents", settings?.cv_path);

  return (
    <div className="section-body contact" data-inner-scroll>
      <div className="contact__body">
        <div className="contact__form">
          <p className="section-intro text-body text-ink measure">
            Tell me what you&rsquo;re building, or what you need built.
          </p>
          <ContactForm emailUser={emailUser ?? null} emailDomain={emailDomain ?? null} />
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
