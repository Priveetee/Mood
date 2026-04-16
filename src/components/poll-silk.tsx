"use client";

import { Canvas, type RootState, useFrame, useThree } from "@react-three/fiber";
import type React from "react";
import { forwardRef, memo, useEffect, useLayoutEffect, useRef } from "react";
import { Color, type IUniform, type Mesh, type ShaderMaterial } from "three";
import { POLL_SILK_FRAGMENT_SHADER, POLL_SILK_VERTEX_SHADER } from "./poll-silk-shaders";

type NormalizedRGB = [number, number, number];

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

interface UniformValue<T = number | Color> {
  value: T;
}

interface SilkUniforms {
  uSpeed: UniformValue<number>;
  uScale: UniformValue<number>;
  uNoiseIntensity: UniformValue<number>;
  uColor: UniformValue<Color>;
  uRotation: UniformValue<number>;
  uTime: UniformValue<number>;
  [uniform: string]: IUniform;
}

const COLOR_LERP_RATE = 0.22;
const MAX_COLOR_LERP_STEP = 0.06;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
  targetColor: React.MutableRefObject<Color>;
}

const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane(
  { uniforms, targetColor },
  ref,
) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    const mesh = ref as React.MutableRefObject<Mesh | null>;
    if (mesh.current) {
      mesh.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_state: RootState, delta: number) => {
    const mesh = ref as React.MutableRefObject<Mesh | null>;
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial & {
        uniforms: SilkUniforms;
      };
      material.uniforms.uTime.value += 0.1 * delta;
      const colorLerpStep = Math.min(delta * COLOR_LERP_RATE, MAX_COLOR_LERP_STEP);
      material.uniforms.uColor.value.lerp(targetColor.current, colorLerpStep);
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={POLL_SILK_VERTEX_SHADER}
        fragmentShader={POLL_SILK_FRAGMENT_SHADER}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

function createUniforms(
  speed: number,
  scale: number,
  noiseIntensity: number,
  color: string,
  rotation: number,
): SilkUniforms {
  return {
    uSpeed: { value: speed },
    uScale: { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uColor: { value: new Color(...hexToNormalizedRGB(color)) },
    uRotation: { value: rotation },
    uTime: { value: 0 },
  };
}

interface PollSilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const PollSilk: React.FC<PollSilkProps> = ({
  speed = 5,
  scale = 1,
  color = "#7B7481",
  noiseIntensity = 1.5,
  rotation = 0,
}) => {
  const meshRef = useRef<Mesh>(null);
  const targetColor = useRef(new Color(...hexToNormalizedRGB(color)));
  const uniformsRef = useRef(createUniforms(speed, scale, noiseIntensity, color, rotation));

  useEffect(() => {
    targetColor.current = new Color(...hexToNormalizedRGB(color));
  }, [color]);

  useEffect(() => {
    uniformsRef.current.uSpeed.value = speed;
    uniformsRef.current.uScale.value = scale;
    uniformsRef.current.uNoiseIntensity.value = noiseIntensity;
    uniformsRef.current.uRotation.value = rotation;
  }, [speed, scale, noiseIntensity, rotation]);

  return (
    <Canvas dpr={[1, 2]} frameloop="always">
      <SilkPlane ref={meshRef} uniforms={uniformsRef.current} targetColor={targetColor} />
    </Canvas>
  );
};

export default memo(PollSilk);
