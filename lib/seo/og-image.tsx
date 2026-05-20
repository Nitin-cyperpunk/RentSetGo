import { ImageResponse } from "next/og";

import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

type OgImageOptions = {
  title?: string;
  subtitle?: string;
};

/** Shared 1200×630 social preview art for opengraph-image routes. */
export function renderOgImage(options: OgImageOptions = {}) {
  const title = options.title ?? SITE_NAME;
  const subtitle = options.subtitle ?? DEFAULT_DESCRIPTION;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(16,185,129,0.35) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(6,182,212,0.2) 0%, transparent 50%), linear-gradient(145deg, #09090b 0%, #18181b 45%, #0f172a 100%)",
          fontFamily: "system-ui, Segoe UI, sans-serif",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 800,
              boxShadow: "0 8px 32px rgba(16,185,129,0.35)",
            }}
          >
            R
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {SITE_NAME}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 920 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {["AI Posters", "Listings", "Direct Contact", "Social Marketing"].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            style={{
              fontSize: title.length > 48 ? 48 : 56,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              textWrap: "balance",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.45,
              color: "rgba(250,250,250,0.78)",
              maxWidth: 880,
            }}
          >
            {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(250,250,250,0.55)",
          }}
        >
          <span>{SITE_TAGLINE}</span>
          <span>rentsetgo · India</span>
        </div>

        <div
          style={{
            position: "absolute",
            right: 64,
            top: 120,
            width: 280,
            height: 360,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(16,185,129,0.08) 100%)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            padding: 24,
            gap: 12,
          }}
        >
          <div
            style={{
              height: 140,
              borderRadius: 12,
              background: "linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #134e4a 100%)",
            }}
          />
          <div style={{ height: 12, width: "70%", borderRadius: 6, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ height: 12, width: "50%", borderRadius: 6, background: "rgba(255,255,255,0.12)" }} />
          <div
            style={{
              marginTop: "auto",
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(16,185,129,0.35)",
              fontSize: 16,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            AI Poster Ready
          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    },
  );
}
