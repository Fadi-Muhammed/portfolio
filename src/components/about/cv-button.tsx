"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * "Download CV", with the file's size beside it.
 *
 * The size is asked for by Part 12 and is worth the request: it is the one thing a person
 * wants to know before clicking a download on a phone, and it is the difference between a
 * link and an informed one. It comes from a HEAD against Storage, so it is the size of the
 * file actually being served rather than a number typed into the database and left there.
 *
 * The button keeps its name whether or not the size arrives (B12): the size is appended,
 * never substituted, so nothing shifts under the pointer and the label never changes.
 */

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function CvButton({ href }: { href: string }) {
  const [size, setSize] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    // A failed or slow HEAD costs nothing: the button already works without it.
    fetch(href, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        const length = Number(response.headers.get("content-length"));
        if (Number.isFinite(length) && length > 0) setSize(formatSize(length));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [href]);

  return (
    <a href={href} download className="cv" target="_blank" rel="noopener noreferrer">
      <Download size={20} strokeWidth={1.5} aria-hidden="true" />
      <span className="text-small font-medium">Download CV</span>
      {size ? (
        <span className="cv__size text-data text-muted">
          PDF · {size}
          <span className="sr-only">, opens in a new tab</span>
        </span>
      ) : (
        <span className="cv__size text-data text-muted">
          PDF
          <span className="sr-only">, opens in a new tab</span>
        </span>
      )}
    </a>
  );
}
