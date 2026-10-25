/* Datos que no cambian con el idioma. Los textos traducibles están en `i18n.ts`. */

export const contact = {
  name: "Rubén Remacha",
  city: "Zaragoza",
  email: "rubexeeuu@gmail.com",
  linkedin:
    "https://www.linkedin.com/in/rub%C3%A9n-remacha-%C3%A1greda-426837357/",
  github: "https://github.com/r3mo27",
};

export type SectionId = "webs" | "trayectoria" | "premios" | "contacto";

export const sections: { id: SectionId; n: string }[] = [
  { id: "webs", n: "01" },
  { id: "trayectoria", n: "02" },
  { id: "premios", n: "03" },
  { id: "contacto", n: "04" },
];

export type Project = {
  id: string;
  name: string;
  url?: string;
  host: string;
  image?: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: "slappy",
    name: "Slappy AV",
    url: "https://slappyweb.vercel.app",
    host: "slappyweb.vercel.app",
    image: "/webs/slappy.jpg",
    accent: "#d8232a",
  },
  {
    id: "kokoda",
    name: "Kokoda Awakened",
    host: "kokoda-awakened",
    image: "/webs/kokoda.jpg",
    accent: "#5b3fd4",
  },
  {
    id: "nexua",
    name: "Nexua",
    url: "https://nexuadev.vercel.app",
    host: "nexuadev.vercel.app",
    image: "/webs/nexua.jpg",
    accent: "#00d4c8",
  },
  {
    id: "remocv",
    name: "RemoCV",
    url: "https://webcurriculum-dusky.vercel.app",
    host: "webcurriculum-dusky.vercel.app",
    image: "/webs/remocv.png",
    accent: "#0f9d76",
  },
];

export type Award = {
  id: string;
  tab: string;
  photos: string[];
};

export const awards: Award[] = [
  {
    id: "teruel",
    tab: "teruel 26",
    photos: ["/premios/teruel1.jpg", "/premios/teruel2.jpg", "/premios/teruel3.jpg"],
  },
  {
    id: "nasa",
    tab: "nasa 25",
    photos: [
      "/premios/nasa3.jpg",
      "/premios/nasa4.jpg",
      "/premios/nasa1.jpeg",
      "/premios/nasa2.jpeg",
    ],
  },
  {
    id: "wave",
    tab: "wave 25",
    photos: [
      "/premios/wave25-5.jpg",
      "/premios/wave25-0.jpg",
      "/premios/wave25-1.jpg",
      "/premios/wave25-2.jpg",
    ],
  },
];
