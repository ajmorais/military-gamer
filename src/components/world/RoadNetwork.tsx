"use client";

const ROAD_EXTENT = 22;
const ROAD_SPACING = 9;
const ROAD_WIDTH = 3.2;
const SIDEWALK_WIDTH = 0.9;

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
      <meshStandardMaterial color="#e8d98a" emissive="#e8d98a" emissiveIntensity={0.3} />
    </mesh>
  ));
}

function StreetSegment({ axis, coord }: { axis: "x" | "z"; coord: number }) {
  const length = ROAD_EXTENT * 2;
  const rotationY = axis === "z" ? 0 : Math.PI / 2;
  return (
    <group>
      <mesh
        position={[axis === "z" ? coord : 0, 0.005, axis === "z" ? 0 : coord]}
        rotation={[-Math.PI / 2, 0, rotationY]}
        receiveShadow
      >
        <planeGeometry args={[ROAD_WIDTH, length]} />
        <meshStandardMaterial color="#26262a" roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            axis === "z" ? coord + side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2) : 0,
            0.02,
            axis === "z" ? 0 : coord + side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2),
          ]}
          rotation={[-Math.PI / 2, 0, rotationY]}
          receiveShadow
        >
          <planeGeometry args={[SIDEWALK_WIDTH, length]} />
          <meshStandardMaterial color="#8c8a82" roughness={0.9} />
        </mesh>
      ))}
      {laneMarkings(axis, coord)}
    </group>
  );
}

function Plaza({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} receiveShadow>
        <circleGeometry args={[4.2, 32]} />
        <meshStandardMaterial color="#9b9686" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.8, 16]} />
        <meshStandardMaterial color="#5d6b66" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#bfe8ff" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3, 0.25, Math.sin(angle) * 3]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[1.1, 0.4, 0.35]} />
            <meshStandardMaterial color="#5c4a36" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 6]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.85, 1.6, 7]} />
        <meshStandardMaterial color="#3c6b3f" roughness={0.85} />
      </mesh>
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
        <Tree key={i} x={plazaPoint.x + t.x} z={plazaPoint.z + t.z} />
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
