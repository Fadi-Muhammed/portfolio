"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Chip, Tag } from "@/components/ui/tag";
import { Toast } from "@/components/ui/toast";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

/**
 * Reads the live computed value of each custom property, so this page can never drift
 * from the tokens: if a swatch is wrong here, the token itself is wrong.
 *
 * The store being subscribed to is the DOM — specifically data-theme on <html>, which
 * is what changes the resolved values. The snapshot is a single joined string because
 * useSyncExternalStore compares snapshots by identity, and a fresh object every call
 * would loop forever.
 */
function subscribeToThemeAttribute(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function useTokenValues(names: readonly string[]): string[] {
  const snapshot = useSyncExternalStore(
    subscribeToThemeAttribute,
    () => {
      const styles = getComputedStyle(document.documentElement);
      return names.map((name) => styles.getPropertyValue(name).trim()).join("|");
    },
    () => "",
  );

  return snapshot ? snapshot.split("|") : [];
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-line py-10">
      <h2 className="text-data text-muted">{label}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <span className="text-data w-full shrink-0 text-muted sm:w-40">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const COLOUR_TOKENS = [
  "--bg",
  "--surface",
  "--ink",
  "--muted",
  "--accent",
  "--signal",
  "--danger",
  "--line",
] as const;

const TYPE_SPECS = [
  { name: "display", className: "text-display", sample: "Unemployed & jobless" },
  { name: "h1", className: "text-h1", sample: "Engineering projects" },
  { name: "h2", className: "text-h2", sample: "Products" },
  { name: "h3", className: "text-h3", sample: "What was built" },
  { name: "body", className: "text-body", sample: "Body copy sits at a 68ch measure." },
  { name: "small", className: "text-small", sample: "Secondary copy and hints." },
  { name: "data", className: "text-data", sample: "hop 3 of 7 · engineering" },
];

export function DesignShowcase() {
  const colourValues = useTokenValues(COLOUR_TOKENS);
  const [filter, setFilter] = useState("telecom");
  const [sending, setSending] = useState(false);

  return (
    <main className="min-h-dvh px-6 pb-24 sm:px-10 lg:px-16">
      <div className="flex items-center justify-between gap-4 py-4">
        <p className="text-data text-muted">Tokens · primitives · states</p>
        <ThemeToggle />
      </div>

      <header className="flex flex-col gap-3 pb-10">
        <h1 className="text-h1 text-ink">Design system</h1>
        <p className="measure text-body text-muted">
          Every value on this page comes from src/styles/tokens.css. The swatches read the live
          custom properties, so if a colour here is wrong, the token is wrong.
        </p>
      </header>

      <Block label="Palette">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {COLOUR_TOKENS.map((token, index) => (
            <li key={token} className="flex flex-col gap-2">
              <span
                className="h-16 w-full rounded-sm border border-line"
                style={{ backgroundColor: `var(${token})` }}
              />
              <span className="text-data text-ink">{token.replace("--", "")}</span>
              <span className="text-data text-muted">{colourValues[index] || "—"}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Type scale">
        <div className="flex flex-col gap-6">
          {TYPE_SPECS.map((spec) => (
            <div key={spec.name} className="flex flex-col gap-2">
              <span className="text-data text-muted">{spec.name}</span>
              <p className={`${spec.className} text-ink`}>{spec.sample}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block label="Buttons">
        <div className="flex flex-col gap-6">
          <Row label="primary">
            <Button>See my work</Button>
            <Button disabled>See my work</Button>
            <Button loading>Sending…</Button>
          </Row>
          <Row label="secondary">
            <Button variant="secondary">Work with me</Button>
            <Button variant="secondary" disabled>
              Work with me
            </Button>
            <Button variant="secondary" loading>
              Sending…
            </Button>
          </Row>
          <Row label="quiet">
            <Button variant="quiet">Copy email</Button>
            <Button variant="quiet" disabled>
              Copy email
            </Button>
            <Button variant="quiet" onClick={() => setSending((value) => !value)} loading={sending}>
              {sending ? "Sending…" : "Toggle loading"}
            </Button>
          </Row>
          <p className="text-small text-muted">
            Hover, focus and active are live — tab through them. Focus rings are 2 px accent at 2 px
            offset, which clears 3:1 against the page ground in both themes.
          </p>
        </div>
      </Block>

      <Block label="Links">
        <Row label="inline">
          <span className="text-body">
            Read the <Link href="/design">design system</Link> or the{" "}
            <Link href="https://github.com/Fadi-Muhammed" external>
              source on GitHub
            </Link>
            .
          </span>
        </Row>
      </Block>

      <Block label="Fields">
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" type="email" hint="I reply from work.fmuhammed@gmail.com." />
          <Input
            label="Email"
            type="email"
            defaultValue="fadi@"
            error="Enter a full email address, like you@example.com."
          />
          <Input label="Name" placeholder="Your name" disabled />
          <Textarea label="Message" placeholder="What are you working on?" />
          <Textarea
            label="Message"
            defaultValue="hi"
            error="Add a little more — at least 20 characters."
          />
        </div>
      </Block>

      <Block label="Card, tags and chips">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <h3 className="text-h3 text-ink">Static card</h3>
            <p className="mt-2 text-small text-muted">
              Surface against the page ground with a hairline. No shadow anywhere on this site.
            </p>
          </Card>
          <Card interactive>
            <h3 className="text-h3 text-ink">Interactive card</h3>
            <p className="mt-2 text-small text-muted">Responds to hover and focus-within.</p>
          </Card>
        </div>
        <Row label="tags">
          <Tag>Next.js</Tag>
          <Tag>Postgres</Tag>
          <Tag>OFDM</Tag>
          <Tag>OSPF</Tag>
        </Row>
        <Row label="chips">
          {["software", "telecom", "hackathon"].map((name) => (
            <Chip key={name} selected={filter === name} onClick={() => setFilter(name)}>
              {name}
            </Chip>
          ))}
        </Row>
      </Block>

      <Block label="Toasts">
        <div className="flex flex-col items-start gap-3">
          <Toast>Copied</Toast>
          <Toast tone="success">Message sent</Toast>
          <Toast tone="error">
            Message didn&rsquo;t send. Check your connection and try again.
          </Toast>
        </div>
      </Block>

      <Block label="Loading and empty">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-48" label="Loading title" />
            <Skeleton className="h-4 w-full max-w-md" label="Loading summary" />
            <Skeleton className="h-32 w-full max-w-md" label="Loading cover image" />
          </div>
          <Card>
            <p className="text-body text-ink">No hops match.</p>
            <p className="mt-1 text-small text-muted">Clear the filters to see everything again.</p>
          </Card>
        </div>
      </Block>

      <Block label="Deck section header and peek strip">
        <p className="text-small text-muted">
          The same bar does two jobs: it is the peek strip while the previous section is active, and
          that section&rsquo;s own heading once you arrive. Its height is the --peek token, which is
          what makes the next section visible below the current one.
        </p>
        <div className="overflow-hidden rounded-md border border-line">
          <div className="deck-section-header">
            <span className="deck-section-name text-h3 text-ink">Engineering</span>
            <span className="deck-section-teaser text-small text-muted">
              Hardware and network work from the lab.
            </span>
          </div>
        </div>
      </Block>

      <Block label="Radius, spacing and motion">
        <Row label="radius">
          {(["none", "sm", "md", "lg"] as const).map((size) => (
            <span
              key={size}
              className="flex size-16 items-center justify-center border border-line bg-surface text-data text-muted"
              style={{ borderRadius: `var(--radius-${size})` }}
            >
              {size}
            </span>
          ))}
        </Row>
        <Row label="spacing">
          {[1, 2, 3, 4, 6, 8, 12].map((step) => (
            <span key={step} className="flex w-14 flex-col items-start gap-2">
              <span className="bg-accent" style={{ width: `${step * 4}px`, height: "12px" }} />
              <span className="text-data text-muted">{step * 4}</span>
            </span>
          ))}
        </Row>
        <Row label="duration">
          <span className="text-data text-muted">fast 200 · base 280 · hop 360 · slow 480</span>
        </Row>
        <Row label="easing">
          <span className="text-data text-muted">cubic-bezier(0.2, 0, 0, 1)</span>
        </Row>
        <p className="text-small text-muted">
          <VisuallyHidden>Note: </VisuallyHidden>
          Under prefers-reduced-motion every duration collapses to 0.01 ms and the packet indicators
          hold still rather than fading, so &ldquo;working&rdquo; never reads as
          &ldquo;dimmed&rdquo;.
        </p>
      </Block>
    </main>
  );
}
