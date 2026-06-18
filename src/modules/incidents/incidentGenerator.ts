import type { Incident, IncidentOption, IncidentType, RegionId } from "@/types";

const INCIDENT_TEMPLATES: Record<IncidentType, { title: string; description: string }> = {
  perturbacao_sossego: {
    title: "Perturbação do sossego",
    description: "Moradores relatam som excessivo em via residencial durante a madrugada.",
  },
  furto: {
    title: "Furto em estabelecimento comercial",
    description: "Comerciante registra desaparecimento de mercadorias na região.",
  },
  roubo: {
    title: "Roubo a transeunte",
    description: "Vítima relata abordagem com subtração de bens pessoais.",
  },
  acidente_transito: {
    title: "Acidente de trânsito",
    description: "Colisão entre dois veículos bloqueia parcialmente a via.",
  },
  desaparecimento: {
    title: "Desaparecimento de pessoa",
    description: "Família reporta ausência prolongada de familiar.",
  },
  evento_publico: {
    title: "Grande aglomeração",
    description: "Evento público reúne multidão, exigindo planejamento de fluxo.",
  },
  apoio_humanitario: {
    title: "Solicitação de apoio humanitário",
    description: "Comunidade local solicita apoio após situação de vulnerabilidade.",
  },
  desastre_natural: {
    title: "Alerta de desastre natural",
    description: "Condições climáticas severas ameaçam área habitada.",
  },
};

function buildOptions(): IncidentOption[] {
  return [
    {
      id: "resposta_rapida",
      label: "Resposta rápida",
      description: "Despachar equipe imediatamente, priorizando tempo de resposta.",
      impact: { publicTrust: 4, troopMorale: -2, resources: -3 },
      xpReward: 40,
      budgetDelta: -200,
    },
    {
      id: "resposta_planejada",
      label: "Resposta planejada",
      description: "Coordenar apoio entre equipes antes do deslocamento.",
      impact: { publicTrust: 2, troopMorale: 3, resources: -1 },
      xpReward: 30,
      budgetDelta: -80,
    },
    {
      id: "delegar_equipe_local",
      label: "Delegar à equipe local",
      description: "Repassar ocorrência à equipe já presente na região.",
      impact: { publicTrust: -1, troopMorale: 1, resources: 1 },
      xpReward: 15,
      budgetDelta: 0,
    },
  ];
}

let incidentCounter = 0;

export function generateIncident(regionId: RegionId, type: IncidentType, severity: 1 | 2 | 3 | 4 | 5): Incident {
  const template = INCIDENT_TEMPLATES[type];
  incidentCounter += 1;
  return {
    id: `incident_${Date.now()}_${incidentCounter}`,
    type,
    regionId,
    severity,
    title: template.title,
    description: template.description,
    options: buildOptions(),
    createdAt: Date.now(),
  };
}

const INCIDENT_TYPES = Object.keys(INCIDENT_TEMPLATES) as IncidentType[];

export function randomIncidentType(): IncidentType {
  return INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
}
