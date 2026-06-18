"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface CharacterState {
  position: THREE.Vector3;
  yaw: number;
  inVehicle: boolean;
}

interface CharacterControllerProps {
  state: CharacterState;
  onUpdate: (pos: THREE.Vector3, yaw: number) => void;
  uniformColor: string;
  skinColor: string;
}

const KEY_MAP: Record<string, "forward" | "backward" | "left" | "right"> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

export function useKeyboardControls() {
  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    function handleDown(e: KeyboardEvent) {
      const action = KEY_MAP[e.code];
      if (action) keys.current[action] = true;
    }
    function handleUp(e: KeyboardEvent) {
      const action = KEY_MAP[e.code];
      if (action) keys.current[action] = false;
    }
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return keys;
}

export function CharacterController({ state, onUpdate, uniformColor, skinColor }: CharacterControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useKeyboardControls();
  const { camera } = useThree();
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    const speed = state.inVehicle ? 9 : 3.2;
    const rotSpeed = 2.2;
    let { yaw } = state;
    const pos = state.position.clone();

    if (keys.current.left) yaw += rotSpeed * delta;
    if (keys.current.right) yaw -= rotSpeed * delta;

    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    let moved = false;
    if (keys.current.forward) {
      pos.addScaledVector(forward, speed * delta);
      moved = true;
    }
    if (keys.current.backward) {
      pos.addScaledVector(forward, -speed * delta);
      moved = true;
    }

    pos.x = THREE.MathUtils.clamp(pos.x, -24, 24);
    pos.z = THREE.MathUtils.clamp(pos.z, -24, 24);

    onUpdate(pos, yaw);

    if (groupRef.current) {
      groupRef.current.position.set(pos.x, state.inVehicle ? 0.4 : 0, pos.z);
      groupRef.current.rotation.y = yaw;
      bobRef.current = moved ? bobRef.current + delta * 10 : 0;
      groupRef.current.position.y += state.inVehicle ? 0 : Math.abs(Math.sin(bobRef.current)) * 0.05;
    }

    const camOffset = new THREE.Vector3(-Math.sin(yaw) * 6, 3.2, -Math.cos(yaw) * 6);
    const desiredCamPos = pos.clone().add(camOffset);
    camera.position.lerp(desiredCamPos, 1 - Math.pow(0.001, delta));
    camera.lookAt(pos.x, pos.y + 1.2, pos.z);
  });

  return (
    <group ref={groupRef}>
      {!state.inVehicle && (
        <group>
          <mesh position={[0, 1.05, 0]} castShadow>
            <capsuleGeometry args={[0.32, 0.9, 4, 8]} />
            <meshStandardMaterial color={uniformColor} />
          </mesh>
          <mesh position={[0, 1.75, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
        </group>
      )}
    </group>
  );
}
