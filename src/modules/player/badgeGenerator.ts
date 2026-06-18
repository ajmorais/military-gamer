/** Gera um emblema original em SVG a partir de um seed, sem reutilizar símbolos oficiais. */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function generateBadgeSvg(seed: string): string {
  const hash = hashSeed(seed);
  const hue = hash % 360;
  const shapeSeed = (hash >> 8) % 3;
  const fill = `hsl(${hue}, 60%, 45%)`;
  const accent = `hsl(${(hue + 120) % 360}, 60%, 60%)`;

  const shapes = [
    `<polygon points="50,5 95,35 80,95 20,95 5,35" fill="${fill}" />`,
    `<rect x="15" y="15" width="70" height="70" rx="12" fill="${fill}" />`,
    `<circle cx="50" cy="50" r="45" fill="${fill}" />`,
  ];

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${shapes[shapeSeed]}
    <circle cx="50" cy="50" r="20" fill="${accent}" />
  </svg>`;
}
