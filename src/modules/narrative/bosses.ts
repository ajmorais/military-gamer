import type { GlobalIndicatorsDelta, RegionId } from "@/types";

export interface BossChoice {
  id: string;
  label: string;
  description: string;
  impact: GlobalIndicatorsDelta;
  xpReward: number;
  budgetDelta: number;
  outcome: string;
}

export interface BossEncounter {
  id: string;
  name: string;
  title: string;
  regionId: RegionId;
  point: { x: number; z: number };
  introLines: string[];
  choices: BossChoice[];
}

export const BOSS_ENCOUNTERS: BossEncounter[] = [
  {
    id: "o_corruptor",
    name: "O Corruptor",
    title: "Articulador de esquemas na Metropolitana",
    regionId: "metropolitana",
    point: { x: 14, z: -10 },
    introLines: [
      "Um homem de terno escuro aguarda encostado num carro, sorrindo.",
      "\"Sargento... ouvi dizer que andam fazendo perguntas sobre certos contratos.\"",
      "\"Que tal a gente resolver isso entre nós, sem burocracia?\"",
    ],
    choices: [
      {
        id: "recusar_denunciar",
        label: "Recusar e abrir investigação formal",
        description: "Você recusa a proposta e registra o contato para apuração interna.",
        impact: { publicTrust: 6, reputation: 8, troopMorale: 2 },
        xpReward: 220,
        budgetDelta: 0,
        outcome: "\"Vai se arrepender disso, sargento.\" Ele se afasta, mas a denúncia segue para a corregedoria.",
      },
      {
        id: "negociar_informacao",
        label: "Fingir interesse para obter informações",
        description: "Você finge considerar a proposta para descobrir mais sobre o esquema.",
        impact: { reputation: 3, publicTrust: -2, resources: 4 },
        xpReward: 160,
        budgetDelta: 0,
        outcome: "Ele solta detalhes demais, sem saber que está sendo gravado pela corregedoria.",
      },
      {
        id: "aceitar_proposta",
        label: "Aceitar a proposta",
        description: "Você aceita o valor oferecido em troca de silêncio.",
        impact: { reputation: -15, publicTrust: -10, troopMorale: -4 },
        xpReward: 0,
        budgetDelta: 1500,
        outcome: "O dinheiro entra na conta, mas algo nesse acordo vai persegui-lo.",
      },
    ],
  },
];
