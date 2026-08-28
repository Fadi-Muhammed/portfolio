/**
 * Sets `data-theme` on <html> before first paint, so the page never renders in the
 * wrong theme and then corrects itself. This has to be a blocking inline script —
 * anything deferred runs after the first frame, which is the flash we are avoiding.
 *
 * It is deliberately tiny and total: any failure (private mode, storage disabled)
 * falls through to the system preference via the media query in tokens.css.
 */
const script = `(function(){try{var s=localStorage.getItem("theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
