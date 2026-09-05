import { ImageResponse } from "next/og";

/**
 * The home-screen icon on iOS, which needs a PNG and cannot use icon.svg.
 *
 * The same mark as the favicon, drawn at 180px with the proportions scaled rather than
 * redrawn — iOS applies its own rounding, so this stays a full-bleed square.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#0e1419",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 39,
          width: 68,
          height: 23,
          backgroundColor: "#e4e9ee",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 39,
          width: 23,
          height: 102,
          backgroundColor: "#e4e9ee",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 79,
          width: 51,
          height: 23,
          backgroundColor: "#e4e9ee",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 118,
          top: 79,
          width: 23,
          height: 23,
          backgroundColor: "#ffb84d",
        }}
      />
    </div>,
    size,
  );
}
