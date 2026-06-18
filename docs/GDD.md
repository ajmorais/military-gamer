# Game Design Document — Sertão Operações

> **Aviso legal:** Esta obra é inteiramente fictícia. Qualquer semelhança com instituições, organizações ou pessoas reais é mera coincidência. O jogo não possui vínculo, autorização ou representação oficial de qualquer órgão público. Todos os nomes, emblemas, hierarquias, viaturas e locais são fictícios e gerados originalmente para esta obra.

## 1. Visão Geral

**Título:** Sertão Operações
**Gênero:** Simulador de gestão operacional / RPG de carreira / Estratégia
**Plataforma:** Web (Next.js + Firebase), responsivo desktop/tablet
**Facção fictícia:** Força de Segurança Territorial do Sertão (FSTS)
**Estado fictício:** Nova Aratanha
**Capital fictícia:** Santa Aurora

O jogador assume o papel de um(a) **Cadete Operacional** da FSTS e progride na carreira administrando patrulhamento, ocorrências, efetivo, equipamentos e relações com a população, em um estado fictício com cinco regiões distintas.

## 2. Pilares de Design

1. **Liderança** — decisões de comando afetam moral da tropa e confiança pública.
2. **Gestão de recursos** — orçamento, efetivo, viaturas e equipamentos fictícios são finitos.
3. **Tomada de decisão sob pressão** — ocorrências com múltiplos desfechos, sem solução única "correta".
4. **Progressão de carreira** — sistema de patentes fictícias e especializações.
5. **Mundo dinâmico** — clima, criminalidade e eventos públicos reagem às escolhas do jogador.

## 3. Hierarquia Fictícia (Patentes)

| Nível | Patente fictícia | XP necessário (acumulado) |
|---|---|---|
| 1 | Cadete Operacional | 0 |
| 2 | Aspirante | 1.000 |
| 3 | Oficial Supervisor | 3.500 |
| 4 | Oficial Coordenador | 8.000 |
| 5 | Comandante Regional | 16.000 |
| 6 | Comandante Geral | 30.000 |

Cada patente desbloqueia novas permissões de gestão (ex.: Comandante Regional pode realocar viaturas entre regiões; Comandante Geral define orçamento estadual).

## 4. Sistema de Experiência (XP)

Fontes de XP:

- Atendimento de ocorrências (XP varia por complexidade e desfecho).
- Planejamento operacional (criação de escalas, rondas preventivas).
- Treinamento de efetivo.
- Mediação de conflitos comunitários.
- Redução de indicadores criminais regionais (XP recorrente por ciclo/mês fictício).

## 5. Sistema de Patrulhamento e Ocorrências

Ocorrências fictícias geradas aleatoriamente, ponderadas pela região e por eventos dinâmicos ativos:

- Perturbação do sossego
- Furto
- Roubo
- Acidente de trânsito
- Desaparecimento de pessoa
- Evento público (grande aglomeração)
- Apoio humanitário
- Desastre natural (enchente, incêndio florestal)

Cada ocorrência possui:
- **Gatilho** (local, hora, região, gravidade)
- **Janela de decisão** (2-4 opções táticas/administrativas, nunca instruções de combate reais)
- **Múltiplos desfechos** afetando moral, confiança pública, recursos e reputação
- **Recompensa** em XP e/ou orçamento

## 6. Sistema de Gestão (Headquarters)

O jogador administra, a partir do "Centro de Comando Regional":

- **Efetivo**: contratação, escalas, folgas, desgaste/fadiga.
- **Viaturas fictícias**: frota, manutenção, alocação por região.
- **Equipamentos fictícios**: coletes, rádios, kits de primeiros socorros (sem armamento ofensivo detalhado).
- **Orçamento**: receita fictícia do estado, gastos com manutenção/treinamento/contratação.
- **Treinamento**: cursos fictícios que melhoram atributos da equipe (não detalham técnicas reais de combate).

## 7. Sistema de Decisão e Indicadores

Toda decisão importante impacta 4 indicadores globais (0-100):

- **Moral da tropa**
- **Confiança da população**
- **Recursos disponíveis**
- **Reputação institucional**

Indicadores muito baixos geram eventos negativos em cascata (greves de efetivo, protestos fictícios); indicadores altos desbloqueiam bônus de orçamento e eventos positivos.

## 8. Mapa — Estado Fictício de Nova Aratanha

5 regiões, cada uma com perfil de ocorrências e desafios próprios:

| Região | Perfil |
|---|---|
| Região Metropolitana (Santa Aurora) | Alta densidade, ocorrências urbanas, eventos públicos |
| Região Serrana | Acidentes em estradas, resgates, clima frio fictício |
| Região Costeira | Turismo, eventos de massa, ocorrências sazonais |
| Região Rural | Baixa densidade, tempo de resposta longo, desaparecimentos |
| Região Industrial | Acidentes de trabalho, riscos ambientais |

## 9. IA de Eventos Dinâmicos

Motor de eventos que gera, por ciclo de jogo (dia/semana fictícios):
- Condição climática regional
- Índice de criminalidade regional (sobe/desce conforme decisões)
- Eventos públicos agendados (festivais fictícios, jogos)
- Crises regionais (enchente, falta de efetivo, crise de confiança)

As escolhas do jogador alimentam esses índices, criando um mundo reativo.

## 10. Segurança de Conteúdo (Guardrails de Design)

Este jogo **não** modela:
- Técnicas reais de combate ou táticas operacionais reais
- Instruções de uso de armamento
- Procedimentos policiais reais documentados
- Conteúdo político-partidário

O foco mecânico permanece em **liderança, gestão e decisão administrativa/estratégica**.

## 11. Monetização Ética

- Sem loot boxes, sem pay-to-win.
- Cosméticos fictícios (emblemas de unidade gerados proceduralmente, cores de viatura).
- Expansões de conteúdo pagas (novas regiões, novos tipos de ocorrência).
- Assinatura opcional para múltiplos slots de "comando" (saves) e estatísticas avançadas.

## 12. Roadmap

- **v0.1 (MVP)**: autenticação, criação de personagem, 1 região, ocorrências básicas, XP/patentes.
- **v0.2**: gestão de efetivo/viaturas/orçamento, indicadores globais.
- **v0.3**: 5 regiões, eventos dinâmicos, treinamento.
- **v0.4**: ranking entre jogadores, emblemas gerados, economia avançada.
- **v1.0**: polimento de UI, balanceamento, expansão de conteúdo narrativo.

## 13. Expansão Futura

- Modo cooperativo (mais de um comandante na mesma região).
- Editor de cenários de ocorrências para criadores de conteúdo.
- Temporadas fictícias com eventos sazonais (festivais, crises climáticas).
- Localização para outros estados fictícios (universo expansível).
