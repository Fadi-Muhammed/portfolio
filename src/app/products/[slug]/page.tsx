import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CopyLink } from "@/components/products/copy-link";
import { Tag } from "@/components/ui/tag";
import { Markdown } from "@/lib/content/markdown";
import { galleryImages, mediaUrl, parseMetrics } from "@/lib/content/media";
import { getProduct, getProducts } from "@/lib/content/queries";
import { WorkJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";

/**
 * A product case study.
 *
 * Statically generated from the data layer and revalidated on the same schedule as
 * everything else, so a change in Studio reaches the page without a deploy.
 */

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

// A slug that is not in the list at build time still renders, then 404s if it is not
// real. That is what lets a product published after the last build appear without one.
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Route not found" };

  return pageMetadata({
    title: product.title,
    description: product.summary,
    path: `/products/${product.slug}`,
    type: "article",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProduct(slug), getProducts()]);
  if (!product) notFound();

  const cover = mediaUrl(product.cover_image_path);
  const gallery = galleryImages(product.gallery).filter(
    (image) => image.path !== product.cover_image_path,
  );
  const metrics = parseMetrics(product.metrics);

  const index = products.findIndex((entry) => entry.slug === product.slug);
  const previous = index > 0 ? products[index - 1] : null;
  const next = index >= 0 && index < products.length - 1 ? products[index + 1] : null;

  return (
    <main className="detail" id="main">
      <WorkJsonLd work={product} path={`/products/${product.slug}`} />
      <p className="detail__back text-data">
        <Link href="/#products">
          <span aria-hidden="true">←</span> Back to products
        </Link>
      </p>

      <header className="detail__head">
        <h1 className="text-h1 text-ink">{product.title}</h1>
        {product.summary ? (
          <p className="detail__summary text-body text-muted measure">{product.summary}</p>
        ) : null}
      </header>

      {cover ? (
        <Image
          src={cover}
          alt={galleryImages(product.gallery)[0]?.alt ?? `${product.title} in use`}
          width={1917}
          height={962}
          priority
          className="detail__cover"
          style={{ viewTransitionName: `cover-${product.slug}` }}
          sizes="(min-width: 1024px) 60rem, 100vw"
        />
      ) : null}

      <div className="detail__grid">
        <div className="detail__body">
          <Markdown>{product.body}</Markdown>
        </div>

        <aside className="detail__aside">
          {product.stack.length > 0 ? (
            <section>
              <h2 className="text-data text-muted">Stack</h2>
              <ul className="detail__tags">
                {product.stack.map((entry) => (
                  <li key={entry}>
                    <Tag>{entry}</Tag>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {metrics ? (
            <section>
              {/* The basis is the heading, not a footnote. A figure whose standing is
                  unstated is a claim; stating it is the difference. */}
              <h2 className="text-data text-muted">
                {metrics.basis === "projected" ? "Projected" : "Measured"}
              </h2>
              <dl className="detail__metrics">
                {metrics.items.map((item) => (
                  <div key={item.label}>
                    <dt className="text-h3 text-ink">{item.value}</dt>
                    <dd className="text-small text-muted">{item.label}</dd>
                  </div>
                ))}
              </dl>
              {metrics.note ? <p className="text-small text-muted">{metrics.note}</p> : null}
            </section>
          ) : null}

          <section>
            <h2 className="text-data text-muted">Links</h2>
            <ul className="detail__links">
              {product.live_url ? (
                <li>
                  <a href={product.live_url} target="_blank" rel="noopener noreferrer">
                    Open the demo <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ) : null}
              {product.repo_url ? (
                <li>
                  <a href={product.repo_url} target="_blank" rel="noopener noreferrer">
                    Source <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ) : null}
              <li>
                <CopyLink />
              </li>
            </ul>
          </section>
        </aside>
      </div>

      {/*
        Full width, not inside the reading column. These are dense product screenshots:
        at the prose measure they were half the width of the cover above them, which
        read as a mistake and made the interface in them illegible. The caption carries
        the description, so the image itself takes an empty alt rather than saying the
        same thing twice to a screen reader.
      */}
      {gallery.length > 0 ? (
        <section className="detail__gallery" aria-label="Screenshots">
          {gallery.map((image) => {
            const url = mediaUrl(image.path);
            return url ? (
              <figure key={image.path}>
                <Image
                  src={url}
                  alt=""
                  width={1917}
                  height={962}
                  loading="lazy"
                  sizes="(min-width: 64rem) 72rem, 100vw"
                />
                <figcaption className="text-small text-muted">{image.alt}</figcaption>
              </figure>
            ) : null;
          })}
        </section>
      ) : null}

      {previous || next ? (
        <nav className="detail__nav" aria-label="Other products">
          {previous ? (
            <Link href={`/products/${previous.slug}`}>
              <span className="text-data text-muted">Previous</span>
              <span className="text-h3 text-ink">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/products/${next.slug}`} className="detail__nav-next">
              <span className="text-data text-muted">Next</span>
              <span className="text-h3 text-ink">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
