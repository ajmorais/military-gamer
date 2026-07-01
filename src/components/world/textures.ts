"use client";

import * as THREE from "three";

/**
 * Texturas procedurais geradas em canvas — dão superfícies com grão e variação
 * (asfalto, calçada, terreno, fachadas) sem depender de assets externos.
 */

const cache = new Map<string, THREE.CanvasTexture>();

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function finishTexture(canvas: HTMLCanvasElement, repeat: number): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Asfalto escuro com grão, manchas de desgaste e rachaduras. */
export function getAsphaltTexture(): THREE.CanvasTexture {
  const key = "asphalt";
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 256;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const rand = seededRandom(42);

  ctx.fillStyle = "#2b2b2f";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 9000; i++) {
    const v = 30 + rand() * 40;
    ctx.fillStyle = `rgba(${v}, ${v}, ${v + 4}, ${0.2 + rand() * 0.4})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  // manchas de óleo/desgaste
  for (let i = 0; i < 14; i++) {
    const g = ctx.createRadialGradient(
      rand() * size, rand() * size, 2,
      rand() * size, rand() * size, 20 + rand() * 40
    );
    g.addColorStop(0, "rgba(18,18,20,0.35)");
    g.addColorStop(1, "rgba(18,18,20,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  // rachaduras finas
  ctx.strokeStyle = "rgba(15,15,16,0.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    let x = rand() * size;
    let y = rand() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 10; s++) {
      x += (rand() - 0.5) * 30;
      y += (rand() - 0.5) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = finishTexture(canvas, 4);
  cache.set(key, texture);
  return texture;
}

/** Calçada de concreto com juntas de dilatação. */
export function getSidewalkTexture(): THREE.CanvasTexture {
  const key = "sidewalk";
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 256;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const rand = seededRandom(7);

  ctx.fillStyle = "#8f8d84";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6000; i++) {
    const v = 120 + rand() * 50;
    ctx.fillStyle = `rgba(${v}, ${v - 3}, ${v - 10}, ${0.15 + rand() * 0.3})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  ctx.strokeStyle = "rgba(60,58,52,0.7)";
  ctx.lineWidth = 3;
  for (let p = 0; p <= size; p += 64) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  const texture = finishTexture(canvas, 6);
  cache.set(key, texture);
  return texture;
}

/** Terreno natural (terra batida + vegetação rasteira) tingido pela cor da região. */
export function getGroundTexture(baseColor: string): THREE.CanvasTexture {
  const key = `ground-${baseColor}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 512;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const rand = seededRandom(1234);
  const base = new THREE.Color(baseColor);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  // variação de tom orgânica
  for (let i = 0; i < 60; i++) {
    const shade = base.clone().multiplyScalar(0.75 + rand() * 0.5);
    const g = ctx.createRadialGradient(
      rand() * size, rand() * size, 4,
      rand() * size, rand() * size, 30 + rand() * 90
    );
    g.addColorStop(0, `rgba(${shade.r * 255 | 0}, ${shade.g * 255 | 0}, ${shade.b * 255 | 0}, 0.35)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  // grão fino (pedrisco / mato)
  for (let i = 0; i < 18000; i++) {
    const shade = base.clone().multiplyScalar(0.55 + rand() * 0.9);
    ctx.fillStyle = `rgba(${shade.r * 255 | 0}, ${shade.g * 255 | 0}, ${shade.b * 255 | 0}, ${0.2 + rand() * 0.4})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }

  const texture = finishTexture(canvas, 10);
  cache.set(key, texture);
  return texture;
}

export interface FacadeMaps {
  map: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
}

/**
 * Fachada de prédio com grade de janelas. Retorna o mapa de cor (dia) e um
 * mapa emissivo com parte das janelas acesas, para uso à noite.
 */
export function getFacadeMaps(wallColor: string, trimColor: string, seed: number): FacadeMaps {
  const key = `facade-${wallColor}-${trimColor}-${seed % 8}`;
  const cachedMap = cache.get(`${key}-map`);
  const cachedEmissive = cache.get(`${key}-emissive`);
  if (cachedMap && cachedEmissive) return { map: cachedMap, emissiveMap: cachedEmissive };

  const size = 256;
  const rand = seededRandom(seed % 8 + 3);

  const colorCanvas = makeCanvas(size);
  const cctx = colorCanvas.getContext("2d")!;
  const emissiveCanvas = makeCanvas(size);
  const ectx = emissiveCanvas.getContext("2d")!;

  const wall = new THREE.Color(wallColor);
  cctx.fillStyle = `#${wall.getHexString()}`;
  cctx.fillRect(0, 0, size, size);
  // sujeira/desgaste da parede
  for (let i = 0; i < 4000; i++) {
    const shade = wall.clone().multiplyScalar(0.7 + rand() * 0.5);
    cctx.fillStyle = `rgba(${shade.r * 255 | 0}, ${shade.g * 255 | 0}, ${shade.b * 255 | 0}, 0.25)`;
    cctx.fillRect(rand() * size, rand() * size, 1 + rand() * 3, 1 + rand() * 3);
  }
  // escorrimento sob as janelas
  ectx.fillStyle = "#000000";
  ectx.fillRect(0, 0, size, size);

  const cols = 4;
  const rows = 5;
  const winW = 28;
  const winH = 26;
  const gapX = size / cols;
  const gapY = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * gapX + (gapX - winW) / 2;
      const y = r * gapY + (gapY - winH) / 2;
      // moldura
      cctx.fillStyle = trimColor;
      cctx.fillRect(x - 2, y - 2, winW + 4, winH + 4);
      // vidro (dia): reflexo azulado
      const glass = cctx.createLinearGradient(x, y, x + winW, y + winH);
      glass.addColorStop(0, "#2c3a46");
      glass.addColorStop(0.5, "#48606e");
      glass.addColorStop(1, "#22303a");
      cctx.fillStyle = glass;
      cctx.fillRect(x, y, winW, winH);
      // mancha de escorrimento
      cctx.fillStyle = "rgba(30,30,30,0.18)";
      cctx.fillRect(x, y + winH + 2, winW, 10);

      // emissivo: ~45% das janelas acesas, tom quente variado
      if (rand() < 0.45) {
        const warm = 200 + rand() * 55;
        ectx.fillStyle = `rgb(${warm | 0}, ${(warm * 0.78) | 0}, ${(warm * 0.45) | 0})`;
        ectx.fillRect(x, y, winW, winH);
      }
    }
  }

  const map = finishTexture(colorCanvas, 1);
  const emissiveMap = finishTexture(emissiveCanvas, 1);
  cache.set(`${key}-map`, map);
  cache.set(`${key}-emissive`, emissiveMap);
  return { map, emissiveMap };
}

/** Sprite suave de nuvem para billboards no céu. */
export function getCloudTexture(): THREE.CanvasTexture {
  const key = "cloud";
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 256;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d")!;
  const rand = seededRandom(99);

  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < 26; i++) {
    const cx = size / 2 + (rand() - 0.5) * size * 0.55;
    const cy = size / 2 + (rand() - 0.5) * size * 0.3;
    const radius = 18 + rand() * 42;
    const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
    g.addColorStop(0, "rgba(255,255,255,0.32)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}
