import type { SectionId } from "./data";

export type Lang = "en" | "es";

export const langs: Lang[] = ["en", "es"];
export const defaultLang: Lang = "en";

const en = {
  topbar: { cta: "Get in touch", language: "Language" },
  sections: {
    webs: "websites",
    trayectoria: "experience",
    premios: "awards",
    contacto: "contact",
  } as Record<SectionId, string>,
  sectionsNav: "Sections",
  blueprint: { height: "drawer height" },
  hero: {
    label: "Home",
    motto: "I build websites. And everything behind them.",
    intro:
      "Custom websites and Java backends. Tap a tab or scroll down: every section is a folder in this drawer.",
    open: "Open the drawer",
    papers: [
      { id: "age", n: "age", t: "21", d: "Full-stack developer" },
      { id: "base", n: "based in", t: "Zaragoza", d: "On site or remote" },
      { id: "projects", n: "projects", t: "+10", d: "Websites, APIs and bots" },
    ],
  },
  webs: {
    title: "Websites",
    tabs: "Projects",
    hint: "← drag in any direction · autoplay · click one at the back →",
    visit: (host: string) => `Open ${host} ↗`,
    private: "Private · demo on request",
    screenshot: (name: string) => `Screenshot of ${name}`,
    season: "Season 3",
    projects: {
      slappy: {
        kind: "Unofficial site",
        lead: "Unofficial fan site: new album up front, most played tracks, discography, tour dates with tickets and a merch store.",
        detail:
          "Made for Slappy, a hyperpop artist from Zaragoza with over 100K monthly listeners.",
      },
      kokoda: {
        kind: "Tournament platform",
        lead: "The community's tournament hub: weekly brackets, rankings by wins and seasons, and an Iggy-to-Dio ladder.",
        detail: "Next.js, TypeScript and Supabase with Postgres, Auth and RLS.",
      },
      nexua: {
        kind: "Creative studio",
        lead: "Website for a design and development studio: services, work, process and contact, with motion and an identity you feel from the hero.",
        detail: "Built to convert: every section nudges you to book a call.",
      },
      remocv: {
        kind: "Tool",
        lead: "Résumé builder with built-in AI, ATS analysis and several professional templates.",
        detail: "You write, the AI polishes, and you export a PDF ready to send.",
      },
    } as Record<string, { kind: string; lead: string; detail: string }>,
  },
  trayectoria: {
    title: "Experience",
    timeline: [
      {
        when: "2025 — now",
        title: "Backend Developer",
        where: "BTS",
        text: "Java and Spring Boot with hexagonal architecture. REST and GraphQL APIs, Kafka and automated tests.",
      },
      {
        when: "2026 — now",
        title: "Master's in Cybersecurity",
        where: "In progress",
        text: "Application, network and systems security.",
      },
      {
        when: "2024 — 2026",
        title: "DAM",
        where: "Salesianos Zaragoza",
        text: "Higher vocational degree in Multiplatform Application Development. Plus a few hackathons.",
      },
      {
        when: "2024 — 2025",
        title: "Programming teacher",
        where: "IES Clara Campoamor",
        text: "After-school programming classes for high school students.",
      },
    ],
  },
  premios: {
    title: "Awards",
    intro:
      "With Cazadores de Rocolos, my team. Each folder holds its photos: tap to open it, drag the papers to reorder them or tap one to see it full size.",
    photos: (n: number) => `${n} photos`,
    photo: (k: number) => `Photo ${k}`,
    photoOf: (title: string, k: number) => `${title}, photo ${k}`,
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    diploma: "DIPLOMA",
    awards: {
      teruel: {
        date: "2026 · April",
        title: "1st prize · The Wave Teruel",
        text: "Elson Space challenge: onboard AI for high-altitude platforms to filter SAR radar data in real time.",
        diploma: "1st prize",
      },
      nasa: {
        date: "2025 · October",
        title: "Best project · NASA Space Apps Zaragoza",
        text: "First out of 102 participants and a ticket to the global round.",
        diploma: "Best project",
      },
      wave: {
        date: "2025 · April",
        title: "Creative Way · The Wave",
        text: "The most creative idea of the hackathon.",
        diploma: "Creative Way",
      },
    } as Record<string, { date: string; title: string; text: string; diploma: string }>,
  },
  contacto: {
    title: "Tell me what you have in mind.",
    intro:
      "A website for your project, someone for your backend team or a teammate for the next hackathon.",
    tab: "email",
    to: "To: Rubén",
    write: "Write to me",
    writeTo: (email: string) => `Write to me at ${email}`,
    copy: "copy email",
    copied: "copied ✓",
  },
  notFound: {
    tab: "404 · lost folder",
    title: "This folder isn't in the drawer.",
    back: "Back to rem0 ↑",
  },
};

export type Copy = typeof en;

const es: Copy = {
  topbar: { cta: "Escríbeme", language: "Idioma" },
  sections: {
    webs: "webs",
    trayectoria: "trayectoria",
    premios: "premios",
    contacto: "contacto",
  },
  sectionsNav: "Secciones",
  blueprint: { height: "altura cajón" },
  hero: {
    label: "Inicio",
    motto: "Hago webs. Y lo que va detrás.",
    intro:
      "Webs a medida y backend en Java. Pulsa una pestaña o baja: cada sección es una carpeta de este cajón.",
    open: "Abrir el cajón",
    papers: [
      { id: "age", n: "edad", t: "21 años", d: "Desarrollador full-stack" },
      { id: "base", n: "base", t: "Zaragoza", d: "En persona o en remoto" },
      { id: "projects", n: "proyectos", t: "+10", d: "Webs, APIs y bots" },
    ],
  },
  webs: {
    title: "Webs",
    tabs: "Proyectos",
    hint: "← arrastra en cualquier dirección · autoplay · clic en una de atrás →",
    visit: (host) => `Abrir ${host} ↗`,
    private: "Privada · demo bajo petición",
    screenshot: (name) => `Captura de ${name}`,
    season: "Temporada 3",
    projects: {
      slappy: {
        kind: "Web no oficial",
        lead: "Fan site no oficial: disco nuevo en portada, los más escuchados, discografía, gira con entradas y tienda de merch.",
        detail:
          "Hecha para Slappy, artista de hyperpop de Zaragoza con más de 100K oyentes al mes.",
      },
      kokoda: {
        kind: "Plataforma de torneos",
        lead: "El hub de torneos de la comunidad: brackets semanales, rankings por victorias y temporadas, y ranking de Iggy a Dio.",
        detail: "Next.js, TypeScript y Supabase con Postgres, Auth y RLS.",
      },
      nexua: {
        kind: "Estudio creativo",
        lead: "Web del estudio de diseño y desarrollo: servicios, trabajos, proceso y contacto, con motion y una identidad que se nota desde el hero.",
        detail: "Pensada para convertir: cada sección empuja a agendar una llamada.",
      },
      remocv: {
        kind: "Herramienta",
        lead: "Generador de currículums con IA integrada, análisis ATS y varias plantillas profesionales.",
        detail: "Escribes, la IA pule y exportas a PDF listo para enviar.",
      },
    },
  },
  trayectoria: {
    title: "Trayectoria",
    timeline: [
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
    ],
  },
  premios: {
    title: "Premios",
    intro:
      "Con Cazadores de Rocolos, mi equipo. Cada carpeta lleva sus fotos dentro: pulsa para abrirla, arrastra los papeles para ordenarlos o pulsa uno para verlo en grande.",
    photos: (n) => `${n} fotos`,
    photo: (k) => `Foto ${k}`,
    photoOf: (title, k) => `${title}, foto ${k}`,
    close: "Cerrar",
    prev: "Foto anterior",
    next: "Foto siguiente",
    diploma: "DIPLOMA",
    awards: {
      teruel: {
        date: "2026 · abril",
        title: "1er premio · The Wave Teruel",
        text: "Reto de Elson Space: IA a bordo de plataformas de gran altitud para filtrar datos de radar SAR en tiempo real.",
        diploma: "1er premio",
      },
      nasa: {
        date: "2025 · octubre",
        title: "Mejor proyecto · NASA Space Apps Zaragoza",
        text: "Primeros de 102 participantes y pase a la fase internacional.",
        diploma: "Mejor proyecto",
      },
      wave: {
        date: "2025 · abril",
        title: "Creative Way · The Wave",
        text: "La propuesta más creativa del hackatón.",
        diploma: "Creative Way",
      },
    },
  },
  contacto: {
    title: "Cuéntame qué tienes en mente.",
    intro:
      "Una web para tu proyecto, alguien para tu equipo backend o un compañero para el próximo hackatón.",
    tab: "correo",
    to: "Para: Rubén",
    write: "Escríbeme",
    writeTo: (email) => `Escríbeme a ${email}`,
    copy: "copiar correo",
    copied: "copiado ✓",
  },
  notFound: {
    tab: "404 · carpeta perdida",
    title: "Esta carpeta no está en el cajón.",
    back: "Volver a rem0 ↑",
  },
};

export const copy: Record<Lang, Copy> = { en, es };
