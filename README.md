# Sertão Operações

Simulador de gestão operacional, RPG de carreira e estratégia ambientado em um universo **inteiramente fictício**: a *Força de Segurança Territorial do Sertão (FSTS)*, no estado fictício de **Nova Aratanha** (capital **Santa Aurora**).

> **Aviso legal:** Esta obra é inteiramente fictícia. Qualquer semelhança com instituições, organizações ou pessoas reais é mera coincidência. O jogo não possui vínculo, autorização ou representação oficial de qualquer órgão público. Não há uso de brasões, logotipos, uniformes, viaturas, distintivos, hinos, insígnias ou marcas registradas de qualquer instituição real.

Documento de design completo em [`docs/GDD.md`](docs/GDD.md).
Modelagem do banco de dados em [`src/database/firestoreSchema.md`](src/database/firestoreSchema.md).

## Stack

- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Backend/Banco:** Firebase (Auth + Firestore)
- **Hospedagem:** Vercel

## Estrutura de pastas

```
src/
  app/                 # rotas Next.js (App Router)
  modules/
    player/            # patentes, XP, geração de emblemas
    operations/        # regiões, indicadores globais
    incidents/         # geração e resolução de ocorrências
    vehicles/          # frota fictícia
    training/          # cursos de treinamento da equipe
    headquarters/       # gestão administrativa (a expandir)
    ranking/           # leaderboard
    economy/           # orçamento
  components/          # componentes de UI reutilizáveis
  services/            # integração com Firebase
  hooks/                # hooks de estado do jogador
  types/                # tipos centrais do domínio
  database/             # modelagem Firestore (documentação)
docs/
  GDD.md                # Game Design Document completo
```

## Fluxograma do loop principal

```
Login (Firebase Auth)
   -> Criação/Carregamento do Comandante (players/{uid})
   -> Centro de Comando (dashboard)
        -> Selecionar região
        -> Iniciar ronda preventiva -> gera Ocorrência
        -> Escolher opção de resposta
             -> aplica delta em XP / orçamento / indicadores
             -> grava log de operações
        -> Gestão (efetivo, viaturas, treinamento, orçamento)
   -> Progressão de patente quando XP atinge limiar
   -> Ranking global (rankings/*)
```

## Wireframes (descrição textual)

1. **Centro de Comando (Home)** — painel lateral esquerdo com emblema, patente, XP, orçamento e indicadores (barras); painel principal com card de ocorrência ativa e botão de "ronda preventiva"; log de operações abaixo.
2. **Tela de Gestão (Headquarters)** — abas para Efetivo, Viaturas e Treinamento, cada uma com tabela de itens e ações rápidas.
3. **Ranking** — lista ordenada por XP com emblema, nome, patente e reputação.

## Configuração do Firebase

Copie `.env.local.example` para `.env.local` e preencha com as credenciais do seu projeto Firebase (Auth + Firestore).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Roadmap

Ver seção 12 do [GDD](docs/GDD.md#12-roadmap).

## Monetização ética

Ver seção 11 do [GDD](docs/GDD.md#11-monetização-ética): sem pay-to-win, cosméticos fictícios, expansões de conteúdo, assinatura opcional de recursos avançados.

## Expansão futura

Ver seção 13 do [GDD](docs/GDD.md#13-expansão-futura).
