# Modelagem Firestore — Sertão Operações

Universo fictício. Nenhuma coleção referencia entidades reais.

## Coleções

### `players/{playerId}`
```
{
  displayName: string,
  rank: Rank,
  xp: number,
  badgeSeed: string,
  budget: number,
  indicators: { troopMorale, publicTrust, resources, reputation },
  assignedRegionId: RegionId,
  createdAt: timestamp
}
```

### `players/{playerId}/personnel/{personnelId}`
```
{
  name: string,
  rank: Rank,
  regionId: RegionId,
  fatigue: number,
  trainingLevel: number
}
```

### `players/{playerId}/vehicles/{vehicleId}`
```
{
  codeName: string,
  regionId: RegionId,
  status: "operacional" | "manutencao" | "indisponivel",
  fuel: number
}
```

### `players/{playerId}/incidents/{incidentId}`
```
{
  type: IncidentType,
  regionId: RegionId,
  severity: 1-5,
  title: string,
  description: string,
  options: IncidentOption[],
  resolvedOptionId: string | null,
  createdAt: timestamp,
  resolvedAt: timestamp | null
}
```

### `regions/{regionId}` (dados globais, somente leitura para o cliente)
```
{
  name: string,
  description: string,
  crimeIndex: number,
  weather: string
}
```

### `rankings/{playerId}` (denormalizado para leaderboard)
```
{
  displayName: string,
  rank: Rank,
  xp: number,
  reputation: number
}
```

## Regras de Segurança (resumo)

- `players/{playerId}`: leitura/escrita apenas pelo próprio usuário autenticado (`request.auth.uid == playerId`).
- Subcoleções (`personnel`, `vehicles`, `incidents`): mesma regra, herdada do documento pai.
- `regions/*`: leitura pública, escrita restrita a Cloud Functions administrativas.
- `rankings/*`: leitura pública, escrita apenas via Cloud Function (para evitar manipulação de XP pelo cliente).
