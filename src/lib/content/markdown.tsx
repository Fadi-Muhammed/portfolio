import type { ReactNode } from "react";

/**
 * A very small markdown renderer for case-study bodies.
 *
 * It renders React elements, never HTML strings, and there is no `dangerouslySetInnerHTML`
 * anywhere in it. That is the whole safety argument: React escapes text nodes, so no
 * amount of markup in a database field can become markup on the page. A renderer that
 * produced an HTML string would need a sanitiser behind it and would be a standing
 * injection risk on content that is edited in a table editor.
 *
 * It supports exactly what the bodies use — `##` headings, paragraphs, `-` lists,
 * `**bold**`, `*italic*`, `` `code` `` and `[links](…)` — and nothing else. Anything it
 * does not recognise is rendered as plain text rather than silently dropped, so a writer
 * sees their syntax and can fix it. Extend it when content needs more; do not reach for a
 * parser and a sanitiser until the content actually justifies both.
 */

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2],
      });
      continue;
    }

    const item = /^[-*]\s+(.*)$/.exec(trimmed);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Splits inline markup into React nodes. Order matters: code first, so nothing inside it is parsed. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    index += 1;

    if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="prose-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const href = link[2];
        // Only http(s) and in-page anchors become links. A `javascript:` href in a
        // database field must never become a working one.
        const safe = /^(https?:\/\/|\/|#)/i.test(href);
        nodes.push(
          safe ? (
            <a
              key={key}
              href={href}
              className="prose-link"
              {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link[1]}
            </a>
          ) : (
            link[1]
          ),
        );
      } else {
        nodes.push(token);
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ children }: { children: string | null | undefined }) {
  if (!children?.trim()) return null;

  return (
    <div className="prose">
      {parseBlocks(children).map((block, blockIndex) => {
        const key = `block-${blockIndex}`;
        if (block.kind === "heading") {
          const Heading = block.level === 2 ? "h2" : "h3";
          return (
            <Heading key={key} className={block.level === 2 ? "text-h2" : "text-h3"}>
              {inline(block.text, key)}
            </Heading>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{inline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={key}>{inline(block.text, key)}</p>;
      })}
    </div>
  );
}
