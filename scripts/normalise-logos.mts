/**
 * Normalises the Featured in logos so a wordmark and a seal carry the same weight.
 *
 *   npm run logos:normalise
 *
 * Reads content/assets/logos-src/** and writes content/assets/logos/**, which is what
 * `npm run assets:upload` sends to the `logos` bucket. Source files are never modified,
 * so re-running after tuning the constants below is free.
 *
 * ## Why this exists
 *
 * B8 asks for logos "normalised to the same visual height". That works for a row of
 * horizontal wordmarks and falls apart on this set: at 44 px tall, Al Fikra's vertical
 * lockup is 16 px wide and DMZ's wordmark is 136 px, so the two are nominally normalised
 * and carry completely different weight.
 *
 * What actually needs to match is ink — how much of the mark lands on the page. That is
 * the alpha mass, and its square root is the mark's optical side length, so scaling every
 * logo to a common side length is what makes a wide wordmark and a square seal weigh the
 * same.
 *
 * Every logo is then centred on an identical canvas. That is the part that matters
 * downstream: nine files with identical intrinsic dimensions means the component needs no
 * per-logo knowledge at all. It renders one box, `object-fit: contain`, nine times.
 */
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp, { type Sharp } from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "content", "assets", "logos-src");
const OUT = path.join(ROOT, "content", "assets", "logos");

/**
 * The canvas is derived from the marks, not chosen; this is only how wide the result is
 * scaled to be. 600 is 3x the ~200 px box the grid gives a logo at 1440, so the marks
 * stay sharp on a third-generation display and there is nothing to tune at other sizes.
 *
 * A fixed canvas was the first attempt and it silently undid the whole exercise: all nine
 * wanted to be larger than a 600x240 frame allowed, so all nine were scaled back to fit
 * and "equal ink" quietly became "fit to box" — the same failure as equal height, arrived
 * at more expensively.
 */
const CANVAS_WIDTH = 600;

/** Breathing room around the marks, so none of them touches its cell's edge. */
const INSET = 0.94;

/**
 * When a mark's alpha is useless as a shape.
 *
 * UC Berkeley's seal is a solid disc, so the monochrome treatment the section applies
 * would render it as a solid disc. Its fill is knocked out instead — the artwork's own
 * light line-work becomes the alpha — so it silhouettes as its engraving.
 *
 * Coverage alone does not identify those marks. DMZ is a bold wordmark that fills 68% of
 * its own bounding box, and it is uniformly black: running the knockout over it would
 * read every pixel as dark, set every alpha to zero, and erase the logo. What separates
 * the two is tone. A filled picture carries light artwork inside dark fill; a wordmark is
 * one colour throughout. So both must hold: mostly opaque, and genuinely two-toned.
 */
const FILLED_COVERAGE = 0.6;
const FILLED_LIGHT_SHARE = 0.05;

/** The luminance window the knockout maps to alpha. Below the floor is fill, above the
 *  ceiling is artwork; between them is the edge. */
const FILL_FLOOR = 0.35;
const FILL_CEILING = 0.7;

if (!existsSync(SRC)) {
  console.error(`No ${path.relative(ROOT, SRC)}. Put the original logo files there.`);
  process.exit(1);
}

type Measured = {
  name: string;
  trimmed: Sharp;
  width: number;
  height: number;
  side: number;
  filled: boolean;
};

/** Trim the transparent padding, knock out a filled mark, then measure the ink. */
async function measure(file: string): Promise<Measured> {
  // trim() removes a uniform border, including a fully transparent one, so a logo
  // exported onto a big empty canvas is compared on its mark rather than on its export.
  const source = await sharp(path.join(SRC, file)).ensureAlpha().trim().png().toBuffer();
  const { width = 1, height = 1 } = await sharp(source).metadata();

  const sourceAlpha = await sharp(source).extractChannel(3).raw().toBuffer();
  const opaque = sourceAlpha.reduce((count, value) => count + (value > 250 ? 1 : 0), 0);
  const filled =
    opaque / (width * height) > FILLED_COVERAGE && (await lightShare(source)) > FILLED_LIGHT_SHARE;

  // The knockout comes before the measurement, not after. A seal measured as a solid disc
  // is the heaviest thing in the set and gets scaled down hardest — then renders as light
  // engraving, and arrives on the page as the smallest mark there by some way.
  const buffer = filled ? await knockOutFill(source) : source;

  // Alpha mass: how many fully opaque pixels the mark is worth, partial coverage
  // included, which is what makes a hairline logo weigh less than a solid one.
  const alpha = await sharp(buffer).extractChannel(3).raw().toBuffer();
  let mass = 0;
  for (const value of alpha) mass += value / 255;

  return {
    name: path.parse(file).name,
    trimmed: sharp(buffer),
    width,
    height,
    side: Math.sqrt(mass),
    filled,
  };
}

/** The share of a mark's opaque pixels that are light — its artwork, if it has any. */
async function lightShare(buffer: Buffer): Promise<number> {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  let light = 0;

  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] <= 128) continue;
    opaque += 1;
    const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    if (luma > 0.7) light += 1;
  }

  return opaque === 0 ? 0 : light / opaque;
}

/**
 * Rebuild a filled mark's alpha from its own luminance, keeping its colours.
 *
 * The seal is navy and gold with white line-work on top. Using luminance as alpha makes
 * the line-work opaque and the fill transparent, so what silhouettes is the engraving.
 * The colour channels are left alone, so the hover state is still the real seal.
 */
async function knockOutFill(buffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += info.channels) {
    // Rec. 709 luma, then gated by the original alpha so the trimmed surround stays out.
    const luma = (0.2126 * out[i] + 0.7152 * out[i + 1] + 0.0722 * out[i + 2]) / 255;
    // Stretched, not used raw. Luminance straight from the artwork gives a mark of
    // graduated alpha, and a monochrome mask draws graduated alpha as a washed-out ghost
    // beside eight flat ones. The curve moves the engraving to opaque and the fill to
    // clear, leaving the anti-aliasing in between.
    const stretched = Math.min(1, Math.max(0, (luma - FILL_FLOOR) / (FILL_CEILING - FILL_FLOOR)));
    out[i + 3] = out[i + 3] > 128 ? Math.round(stretched * 255) : 0;
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

const files = (await readdir(SRC)).filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file));
if (files.length === 0) {
  console.error(`No image files in ${path.relative(ROOT, SRC)}.`);
  process.exit(1);
}

const measured = await Promise.all(files.map(measure));

/*
 * Equal ink first, frame second.
 *
 * Scaling each mark by 1/side puts them all at ink side 1 — the ratios between them are
 * now correct and depend on nothing else. The frame is then whatever holds the widest and
 * the tallest of those, and the whole arrangement is scaled up together at the end.
 *
 * Deriving it in this order is what keeps every mark at its target: pick the frame first
 * and the tall lockup has to be capped to fit it, which is exactly the normalisation this
 * script exists to avoid.
 */
const relative = measured.map((logo) => ({ logo, scale: 1 / logo.side }));
const unitWidth = Math.max(...relative.map((r) => r.logo.width * r.scale));
const unitHeight = Math.max(...relative.map((r) => r.logo.height * r.scale));

const k = (CANVAS_WIDTH * INSET) / unitWidth;
const canvasWidth = CANVAS_WIDTH;
const canvasHeight = Math.round((unitHeight * k) / INSET);

await mkdir(OUT, { recursive: true });

for (const { logo, scale } of relative) {
  const width = Math.max(1, Math.round(logo.width * scale * k));
  const height = Math.max(1, Math.round(logo.height * scale * k));

  const resized = await logo.trimmed.resize(width, height, { fit: "fill" }).png().toBuffer();
  const canvas = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(path.join(OUT, `${logo.name}.png`), canvas);
  const note = logo.filled ? "  (filled mark — fill knocked out)" : "";
  console.log(`  ${logo.name.padEnd(20)} ${String(width).padStart(3)}x${height}${note}`);
}

console.log(
  `\n${measured.length} logos, each centred on the same ${canvasWidth}x${canvasHeight} canvas.`,
);
