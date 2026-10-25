/**
 * URL pública de la web. En Vercel se rellena sola con el dominio de producción; si publicas
 * en otro sitio, define NEXT_PUBLIC_SITE_URL (por ejemplo https://rem0.dev).
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const siteTitle = "rem0 · Rubén Remacha";
export const siteDescription =
  "Rubén Remacha, full-stack developer in Zaragoza, Spain. Custom websites and Java backends, award-winning at NASA Space Apps and The Wave.";
