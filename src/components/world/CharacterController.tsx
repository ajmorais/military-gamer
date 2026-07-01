"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { assetPath } from "@/lib/assetPath";

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
  /** Modelo renderizado no lugar do personagem quando ele está em um veículo. */
  vehicle?: React.ReactNode;
}

const KEY_MAP: Record<string, "forward" | "backward" | "left" | "right" | "run"> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "run",
  ShiftRight: "run",
};

const SOLDIER_MODEL_PATH = assetPath("/models/Soldier.glb");

export function useKeyboardControls() {
  const keys = useRef({ forward: false, backward: false, left: false, right: false, run: false });

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

export function useHumanoidModel() {
  return useGLTF(SOLDIER_MODEL_PATH);
}

function HumanoidActor({
  moving,
  running,
  uniformColor,
  skinColor,
}: {
  moving: boolean;
  running: boolean;
  uniformColor: string;
  skinColor: string;
}) {
  const gltf = useHumanoidModel();
  const cloned = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, cloned);

  useEffect(() => {
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (mat?.name?.toLowerCase().includes("body")) {
          mat.color = new THREE.Color(uniformColor);
          mat.roughness = 0.85;
        }
        if (mat?.name?.toLowerCase().includes("visor")) {
          mat.color = new THREE.Color(skinColor);
        }
      }
    });
  }, [cloned, uniformColor, skinColor]);

  useEffect(() => {
    const clipName = moving ? (running ? "Run" : "Walk") : "Idle";
    const action = actions[clipName] ?? (moving ? actions.Walk : undefined);
    if (!action) return;
    action.reset().fadeIn(0.2).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, moving, running]);

  return <primitive object={cloned} scale={1} />;
}

export function CharacterController({ state, onUpdate, uniformColor, skinColor, vehicle }: CharacterControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useKeyboardControls();
  const { camera } = useThree();
  const [moving, setMoving] = useState(false);
  const [running, setRunning] = useState(false);
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    const isRunning = keys.current.run && !state.inVehicle;
    const targetSpeed = state.inVehicle ? 12 : isRunning ? 6.2 : 3.2;
    // aceleração/frenagem gradual (peso, especialmente na viatura)
    const accel = state.inVehicle ? 8 : 24;
    speedRef.current = THREE.MathUtils.damp(speedRef.current, targetSpeed, accel / targetSpeed, delta);

    const rotSpeed = state.inVehicle ? 1.6 : 2.4;
    let { yaw } = state;
    const pos = state.position.clone();

    if (keys.current.left) yaw += rotSpeed * delta;
    if (keys.current.right) yaw -= rotSpeed * delta;

    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    let moved = false;
    if (keys.current.forward) {
      pos.addScaledVector(forward, speedRef.current * delta);
      moved = true;
    }
    if (keys.current.backward) {
      pos.addScaledVector(forward, -speedRef.current * 0.6 * delta);
      moved = true;
    }

    pos.x = THREE.MathUtils.clamp(pos.x, -24, 24);
    pos.z = THREE.MathUtils.clamp(pos.z, -24, 24);

    onUpdate(pos, yaw);
    if (moved !== moving) setMoving(moved);
    if (isRunning !== running) setRunning(isRunning);

    if (groupRef.current) {
      groupRef.current.position.set(pos.x, 0, pos.z);
      groupRef.current.rotation.y = yaw;
    }

    // câmera em terceira pessoa: mais próxima a pé, mais aberta na viatura
    const camDist = state.inVehicle ? 8.5 : 5.5;
    const camHeight = state.inVehicle ? 3.6 : 2.8;
    const camOffset = new THREE.Vector3(-Math.sin(yaw) * camDist, camHeight, -Math.cos(yaw) * camDist);
    const desiredCamPos = pos.clone().add(camOffset);
    camera.position.lerp(desiredCamPos, 1 - Math.pow(0.001, delta));
    camera.lookAt(pos.x, pos.y + (state.inVehicle ? 1 : 1.3), pos.z);
  });

  return (
    <group ref={groupRef}>
      {state.inVehicle ? (
        vehicle
      ) : (
        <HumanoidActor moving={moving} running={running} uniformColor={uniformColor} skinColor={skinColor} />
      )}
    </group>
  );
}

useGLTF.preload(SOLDIER_MODEL_PATH);
