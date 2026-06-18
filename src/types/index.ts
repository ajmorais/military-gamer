/** Tipos centrais do jogo Sertão Operações (universo fictício). */

export type Rank =
  | "cadete_operacional"
  | "aspirante"
  | "oficial_supervisor"
  | "oficial_coordenador"
  | "comandante_regional"
  | "comandante_geral";

export const RANK_ORDER: Rank[] = [
  "cadete_operacional",
  "aspirante",
  "oficial_supervisor",
  "oficial_coordenador",
  "comandante_regional",
  "comandante_geral",
];

export const RANK_XP_THRESHOLDS: Record<Rank, number> = {
  cadete_operacional: 0,
  aspirante: 1000,
  oficial_supervisor: 3500,
  oficial_coordenador: 8000,
  comandante_regional: 16000,
  comandante_geral: 30000,
};

export type RegionId =
  | "metropolitana"
  | "serrana"
  | "costeira"
  | "rural"
  | "industrial";

export interface Region {
  id: RegionId;
  name: string;
  description: string;
  crimeIndex: number; // 0-100
  weather: string;
}

export type IncidentType =
  | "perturbacao_sossego"
  | "furto"
  | "roubo"
  | "acidente_transito"
  | "desaparecimento"
  | "evento_publico"
  | "apoio_humanitario"
  | "desastre_natural";

export interface IncidentOption {
  id: string;
  label: string;
  description: string;
  impact: GlobalIndicatorsDelta;
  xpReward: number;
  budgetDelta: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  regionId: RegionId;
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  options: IncidentOption[];
  resolvedOptionId?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface GlobalIndicatorsDelta {
  troopMorale?: number;
  publicTrust?: number;
  resources?: number;
  reputation?: number;
}

export interface GlobalIndicators {
  troopMorale: number; // 0-100
  publicTrust: number; // 0-100
  resources: number; // 0-100
  reputation: number; // 0-100
}

export interface Vehicle {
  id: string;
  codeName: string; // nome fictício, ex: "Viatura Sertão-04"
  regionId: RegionId;
  status: "operacional" | "manutencao" | "indisponivel";
  fuel: number; // 0-100
}

export interface Personnel {
  id: string;
  name: string;
  rank: Rank;
  regionId: RegionId;
  fatigue: number; // 0-100
  trainingLevel: number; // 0-10
}

export interface Player {
  id: string;
  displayName: string;
  rank: Rank;
  xp: number;
  badgeSeed: string; // usado para gerar emblema procedural
  budget: number;
  indicators: GlobalIndicators;
  assignedRegionId: RegionId;
  createdAt: number;
  resolvedBossIds: string[];
}

export interface TrainingCourse {
  id: string;
  name: string;
  description: string;
  durationCycles: number;
  cost: number;
  effect: { attribute: "trainingLevel" | "fatigueRecovery"; amount: number };
}
