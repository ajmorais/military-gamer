"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getAsphaltTexture, getSidewalkTexture } from "./textures";

const ROAD_EXTENT = 22;
const ROAD_SPACING = 9;
const ROAD_WIDTH = 3.2;
const SIDEWALK_WIDTH = 0.9;
const CURB_HEIGHT = 0.09;

function laneMarkings(axis: "x" | "z", coord: number) {
  const dashes = [];
  for (let p = -ROAD_EXTENT; p <= ROAD_EXTENT; p += 2.4) {
    dashes.push(p);
  }
  return dashes.map((p, i) => (
    <mesh
      key={i}
      position={axis === "z" ? [coord, 0.012, p] : [p, 0.012, coord]}
      rotation={[-Math.PI / 2, 0, axis === "z" ? 0 : Math.PI / 2]}
    >
      <planeGeometry args={[0.15, 1.1]} />
      <meshStandardMaterial color="#d8c97e" roughness={0.8} />
    </mesh>
  ));
}

function StreetSegment({ axis, coord }: { axis: "x" | "z"; coord: number }) {
  const length = ROAD_EXTENT * 2;
  const rotationY = axis === "z" ? 0 : Math.PI / 2;
  const asphalt = getAsphaltTexture();
  const sidewalk = getSidewalkTexture();
  return (
    <group>
      <mesh
        position={[axis === "z" ? coord : 0, 0.005, axis === "z" ? 0 : coord]}
        rotation={[-Math.PI / 2, 0, rotationY]}
        receiveShadow
      >
        <planeGeometry args={[ROAD_WIDTH, length]} />
        <meshStandardMaterial map={asphalt} color="#8a8a8f" roughness={0.92} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            axis === "z" ? coord + side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2) : 0,
            CURB_HEIGHT / 2,
            axis === "z" ? 0 : coord + side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2),
          ]}
          rotation={[0, rotationY, 0]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[SIDEWALK_WIDTH, CURB_HEIGHT, length]} />
          <meshStandardMaterial map={sidewalk} color="#b7b4aa" roughness={0.88} />
        </mesh>
      ))}
      {laneMarkings(axis, coord)}
    </group>
  );
}

function Plaza({ x, z }: { x: number; z: number }) {
  const sidewalk = getSidewalkTexture();
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} receiveShadow>
        <circleGeometry args={[4.2, 48]} />
        <meshStandardMaterial map={sidewalk} color="#c5bfae" roughness={0.85} />
      </mesh>
      {/* chafariz central */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.8, 24]} />
        <meshStandardMaterial color="#6d7a75" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 20]} />
        <meshPhysicalMaterial color="#7fc4de" roughness={0.05} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 3, 0, Math.sin(angle) * 3]} rotation={[0, -angle, 0]}>
            {/* banco de praça com pés */}
            <mesh position={[0, 0.32, 0]} castShadow>
              <boxGeometry args={[1.1, 0.08, 0.4]} />
              <meshStandardMaterial color="#6b5335" roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.55, -0.17]} rotation={[-0.25, 0, 0]} castShadow>
              <boxGeometry args={[1.1, 0.4, 0.06]} />
              <meshStandardMaterial color="#6b5335" roughness={0.75} />
            </mesh>
            {[-0.45, 0.45].map((side) => (
              <mesh key={side} position={[side, 0.14, 0]} castShadow>
                <boxGeometry args={[0.08, 0.28, 0.36]} />
                <meshStandardMaterial color="#2e2e30" metalness={0.5} roughness={0.5} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Tree({ x, z, seed }: { x: number; z: number; seed: number }) {
  const foliage = useMemo(() => {
    const rand = (n: number) => Math.abs(Math.sin(seed * 12.9898 + n * 78.233)) % 1;
    return Array.from({ length: 3 }).map((_, i) => ({
      x: (rand(i) - 0.5) * 0.7,
      y: 1.35 + rand(i + 3) * 0.7,
      z: (rand(i + 6) - 0.5) * 0.7,
      r: 0.55 + rand(i + 9) * 0.4,
      color: new THREE.Color().setHSL(0.29 + rand(i + 12) * 0.06, 0.42, 0.26 + rand(i + 15) * 0.1),
    }));
  }, [seed]);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 1.3, 8]} />
        <meshStandardMaterial color="#4e3b28" roughness={0.95} />
      </mesh>
      {foliage.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]} castShadow>
          <sphereGeometry args={[f.r, 10, 8]} />
          <meshStandardMaterial color={f.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

const TREE_OFFSETS = [
  { x: -3.5, z: 0 }, { x: 3.5, z: 0 }, { x: 0, z: -3.5 }, { x: 0, z: 3.5 },
];

interface RoadNetworkProps {
  plazaPoint: { x: number; z: number };
}

export function RoadNetwork({ plazaPoint }: RoadNetworkProps) {
  const lines = getRoadCoords();
  return (
    <group>
      {lines.map((coord) => (
        <StreetSegment key={`z-${coord}`} axis="z" coord={coord} />
      ))}
      {lines.map((coord) => (
        <StreetSegment key={`x-${coord}`} axis="x" coord={coord} />
      ))}
      <Plaza x={plazaPoint.x} z={plazaPoint.z} />
      {TREE_OFFSETS.map((t, i) => (
        <Tree key={i} x={plazaPoint.x + t.x} z={plazaPoint.z + t.z} seed={i + 1} />
      ))}
    </group>
  );
}

function getRoadCoords() {
  const coords: number[] = [];
  for (let c = -ROAD_EXTENT; c <= ROAD_EXTENT; c += ROAD_SPACING) {
    coords.push(c);
  }
  return coords;
}
