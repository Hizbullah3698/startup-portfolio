import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the "AC" monogram on the accent gradient, matching the navbar badge. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #FF5A86 0%, #EA0044 55%, #A8002F 100%)",
          color: "#fff",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        AC
      </div>
    ),
    size,
  );
}
