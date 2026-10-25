import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "rem0 · Rubén Remacha — webs y backend en Zaragoza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const blue = "#2536d8";
const navy = "#1a24a6";
const pink = "#f9b6d0";
const cream = "#f2efe6";
const ink = "#11142e";

// Archivo Black, la misma familia que los titulares de la web (latin-ext para tildes y ñ).
// Se lee al cargar el módulo para que la imagen se genere una sola vez en la build.
const [latin, latinExt] = await Promise.all([
  readFile(join(process.cwd(), "assets/archivo-black-latin-400-normal.woff")),
  readFile(join(process.cwd(), "assets/archivo-black-latin-ext-400-normal.woff")),
]);

/** La tarjeta que se ve al compartir el enlace: la carpeta rem0 sobre el plano. */
export default function Image() {
  const grid =
    "linear-gradient(rgba(242,239,230,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,230,0.14) 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: blue,
          backgroundImage: grid,
          backgroundSize: "80px 80px",
          padding: "56px 72px",
          fontFamily: "Archivo Black",
        }}
      >
        <div style={{ display: "flex", color: cream, fontSize: 22, opacity: 0.85 }}>
          Rubén Remacha · Zaragoza
        </div>
        {/* Pestaña con el logo */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            alignSelf: "flex-start",
            background: navy,
            borderRadius: "22px 22px 0 0",
            padding: "14px 34px 0",
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: -6,
            lineHeight: 1,
            color: cream,
          }}
        >
          rem<span style={{ color: pink }}>0</span>
        </div>
        {/* Cuerpo de la carpeta con el frontal rosa */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: navy,
            borderRadius: "0 22px 22px 22px",
            padding: 28,
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-end",
              background: pink,
              borderRadius: 18,
              padding: "36px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: -3,
                lineHeight: 1,
                color: ink,
                maxWidth: 640,
              }}
            >
              Hago webs. Y lo que va detrás.
            </div>
            <div style={{ display: "flex", flexDirection: "column", color: ink, fontSize: 24 }}>
              <span>21 años · Zaragoza</span>
              <span>+10 proyectos</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo Black", data: latin, weight: 400, style: "normal" },
        { name: "Archivo Black", data: latinExt, weight: 400, style: "normal" },
      ],
    },
  );
}
