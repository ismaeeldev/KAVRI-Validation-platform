import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { PWA_ICON_SIZES } from "@/lib/pwa/config";

const ALLOWED = new Set<number>(PWA_ICON_SIZES);

export function generateStaticParams() {
  return PWA_ICON_SIZES.map((size) => ({ size: String(size) }));
}

function renderIcon(size: number, maskable: boolean) {
  const pad = maskable ? Math.round(size * 0.12) : 0;
  const inner = size - pad * 2;
  const fontSize = Math.round(inner * 0.22);
  const subSize = Math.round(inner * 0.075);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: maskable ? "#0a1004" : "#0a1004",
          borderRadius: maskable ? 0 : Math.round(size * 0.16),
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: pad,
          }}
        >
          <div
            style={{
              fontSize,
              fontWeight: 900,
              color: "#fafbf7",
              letterSpacing: "0.1em",
              lineHeight: 1,
            }}
          >
            KAVRI
          </div>
          <div
            style={{
              fontSize: subSize,
              fontWeight: 700,
              color: "#b8ff2e",
              letterSpacing: "0.28em",
              marginTop: Math.round(inner * 0.04),
            }}
          >
            VALIDATION
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ size: string }> }
) {
  const size = Number((await context.params).size);
  if (!ALLOWED.has(size)) {
    return new Response("Not found", { status: 404 });
  }

  const maskable = request.nextUrl.searchParams.get("maskable") === "1";
  return renderIcon(size, maskable);
}
