import type { RegionId } from "@/types";

export interface NpcProfile {
  name: string;
  role: string;
  lines: string[];
}

export const NPC_ROSTER: Record<RegionId, NpcProfile[]> = {
  metropolitana: [
    {
      name: "Dona Iracema",
      role: "Comerciante",
      lines: ["Esses dias o movimento anda fraco no centro.", "Já vi a viatura passar duas vezes hoje."],
    },
    {
      name: "Vando",
      role: "Mototaxista",
      lines: ["Cuidado com o trânsito perto da praça, sargento.", "Andei ouvindo rumor de um esquema ali no bairro."],
    },
    {
      name: "Cleiton",
      role: "Vendedor ambulante",
      lines: ["Quer um suco? Hoje tá em conta.", "A polícia tá mais presente, isso é bom pro comércio."],
    },
  ],
  serrana: [
    {
      name: "Seu Raimundo",
      role: "Agricultor",
      lines: ["A estrada da serra tá ruim depois da chuva.", "Aqui na comunidade a gente se conhece todo mundo."],
    },
    {
      name: "Marinalva",
      role: "Professora rural",
      lines: ["As crianças adoram ver a viatura passar.", "Falta posto de saúde aqui pra cima."],
    },
  ],
  costeira: [
    {
      name: "Capitão Edilson",
      role: "Pescador",
      lines: ["O mar hoje tá calmo, bom pra sair.", "Tem barco estranho rondando o porto à noite."],
    },
    {
      name: "Suelen",
      role: "Guia turística",
      lines: ["Os turistas adoram a orla daqui.", "Andei vendo movimento esquisito perto do cais."],
    },
  ],
  rural: [
    {
      name: "Zé Bento",
      role: "Vaqueiro",
      lines: ["Esse sertão é grande, mas a gente cuida dele.", "Avistei umas pegadas estranhas na fazenda vizinha."],
    },
  ],
  industrial: [
    {
      name: "Engenheiro Aldo",
      role: "Encarregado de fábrica",
      lines: ["A produção não pode parar, mas segurança vem primeiro.", "Tivemos um sumiço de carga no mês passado."],
    },
    {
      name: "Rosa",
      role: "Operária",
      lines: ["O turno aqui é pesado, mas o salário ajuda.", "Tem gente entrando e saindo do galpão à noite."],
    },
  ],
};
