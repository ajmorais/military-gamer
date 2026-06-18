import type { Region } from "@/types";

export const REGIONS: Region[] = [
  {
    id: "metropolitana",
    name: "Região Metropolitana de Santa Aurora",
    description: "Alta densidade populacional, ocorrências urbanas e eventos públicos frequentes.",
    crimeIndex: 45,
    weather: "Ensolarado",
  },
  {
    id: "serrana",
    name: "Região Serrana",
    description: "Estradas sinuosas, acidentes de trânsito e operações de resgate.",
    crimeIndex: 20,
    weather: "Ameno",
  },
  {
    id: "costeira",
    name: "Região Costeira",
    description: "Forte turismo sazonal e eventos de massa em temporada de praia.",
    crimeIndex: 30,
    weather: "Quente e úmido",
  },
  {
    id: "rural",
    name: "Região Rural",
    description: "Baixa densidade, tempo de resposta elevado, casos de desaparecimento.",
    crimeIndex: 15,
    weather: "Seco",
  },
  {
    id: "industrial",
    name: "Região Industrial",
    description: "Acidentes de trabalho e riscos ambientais em polos fabris fictícios.",
    crimeIndex: 35,
    weather: "Nublado",
  },
];
