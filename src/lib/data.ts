export const contact = {
  name: "Rubén Remacha",
  city: "Zaragoza",
  email: "rubexeeuu@gmail.com",
  linkedin:
    "https://www.linkedin.com/in/rub%C3%A9n-remacha-%C3%A1greda-426837357/",
  github: "https://github.com/r3mo27",
};

export type SectionId = "webs" | "trayectoria" | "premios" | "contacto";

export const sections: { id: SectionId; n: string; label: string }[] = [
  { id: "webs", n: "01", label: "webs" },
  { id: "trayectoria", n: "02", label: "trayectoria" },
  { id: "premios", n: "03", label: "premios" },
  { id: "contacto", n: "04", label: "contacto" },
];

/** Los papeles de la carpeta rem0: quién soy, de un vistazo. */
export const heroPapers = [
  { n: "edad", t: "21 años", d: "Desarrollador full-stack" },
  { n: "base", t: "Zaragoza", d: "En persona o en remoto" },
  { n: "proyectos", t: "+10", d: "Webs, APIs y bots" },
];

export type Project = {
  id: string;
  name: string;
  kind: string;
  url?: string;
  host: string;
  image?: string;
  lead: string;
  detail: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: "slappy",
    name: "Slappy AV",
    kind: "Web no oficial",
    url: "https://slappyweb.vercel.app",
    host: "slappyweb.vercel.app",
    image: "/webs/slappy.jpg",
    lead: "Fan site no oficial: disco nuevo en portada, los más escuchados, discografía, gira con entradas y tienda de merch.",
    detail:
      "Hecha para Slappy, artista de hyperpop de Zaragoza con más de 100K oyentes al mes.",
    accent: "#d8232a",
  },
  {
    id: "kokoda",
    name: "Kokoda Awakened",
    kind: "Plataforma de torneos",
    host: "kokoda-awakened",
    image: "/webs/kokoda.jpg",
    lead: "El hub de torneos de la comunidad: brackets semanales, rankings por victorias y temporadas, y ranking de Iggy a Dio.",
    detail: "Next.js, TypeScript y Supabase con Postgres, Auth y RLS.",
    accent: "#5b3fd4",
  },
  {
    id: "nexua",
    name: "Nexua",
    kind: "Estudio creativo",
    url: "https://nexuadev.vercel.app",
    host: "nexuadev.vercel.app",
    image: "/webs/nexua.jpg",
    lead: "Web del estudio de diseño y desarrollo: servicios, trabajos, proceso y contacto, con motion y una identidad que se nota desde el hero.",
    detail: "Pensada para convertir: cada sección empuja a agendar una llamada.",
    accent: "#00d4c8",
  },
  {
    id: "remocv",
    name: "RemoCV",
    kind: "Herramienta",
    url: "https://webcurriculum-dusky.vercel.app",
    host: "webcurriculum-dusky.vercel.app",
    image: "/webs/remocv.png",
    lead: "Generador de currículums con IA integrada, análisis ATS y varias plantillas profesionales.",
    detail: "Escribes, la IA pule y exportas a PDF listo para enviar.",
    accent: "#0f9d76",
  },
];

export const timeline = [
  {
    when: "2025 — hoy",
    title: "Backend Developer",
    where: "BTS",
    text: "Java y Spring Boot con arquitectura hexagonal. APIs REST y GraphQL, Kafka y tests automatizados.",
  },
  {
    when: "2026 — hoy",
    title: "Máster en Ciberseguridad",
    where: "En curso",
    text: "Seguridad de aplicaciones, redes y sistemas.",
  },
  {
    when: "2024 — 2026",
    title: "DAM",
    where: "Salesianos Zaragoza",
    text: "Grado superior de Desarrollo de Aplicaciones Multiplataforma. Y varios hackatones.",
  },
  {
    when: "2024 — 2025",
    title: "Profe de programación",
    where: "IES Clara Campoamor",
    text: "Extraescolares de programación para alumnos de instituto.",
  },
];

export type Award = {
  id: string;
  tab: string;
  date: string;
  title: string;
  text: string;
  photos: string[];
  diploma: string;
};

export const awards: Award[] = [
  {
    id: "teruel",
    tab: "teruel 26",
    date: "2026 · abril",
    title: "1er premio · The Wave Teruel",
    text: "Reto de Elson Space: IA a bordo de plataformas de gran altitud para filtrar datos de radar SAR en tiempo real.",
    photos: ["/premios/teruel1.jpg", "/premios/teruel2.jpg", "/premios/teruel3.jpg"],
    diploma: "1er premio",
  },
  {
    id: "nasa",
    tab: "nasa 25",
    date: "2025 · octubre",
    title: "Mejor proyecto · NASA Space Apps Zaragoza",
    text: "Primeros de 102 participantes y pase a la fase internacional.",
    photos: [
      "/premios/nasa3.jpg",
      "/premios/nasa4.jpg",
      "/premios/nasa1.jpeg",
      "/premios/nasa2.jpeg",
    ],
    diploma: "Mejor proyecto",
  },
  {
    id: "wave",
    tab: "wave 25",
    date: "2025 · abril",
    title: "Creative Way · The Wave",
    text: "La propuesta más creativa del hackatón.",
    photos: [
      "/premios/wave25-5.jpg",
      "/premios/wave25-0.jpg",
      "/premios/wave25-1.jpg",
      "/premios/wave25-2.jpg",
    ],
    diploma: "Creative Way",
  },
];
