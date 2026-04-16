"use client";

import { Canvas, type RootState, useFrame, useThree } from "@react-three/fiber";
import type React from "react";
import { forwardRef, memo, useEffect, useLayoutEffect, useRef } from "react";
import { Color, type IUniform, type Mesh, type ShaderMaterial } from "three";

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

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
const float e = 2.71828182845904523536;
float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}
vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}
void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;
  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

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
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  isStatic?: boolean;
}

const Silk: React.FC<SilkProps> = ({
  speed = 3,
  scale = 1.2,
  color = "#430AC7",
  noiseIntensity = 0.8,
  rotation = 0,
  isStatic = false,
}) => {
  const meshRef = useRef<Mesh>(null);
  const targetColor = useRef(new Color(color));
  const uniformsRef = useRef<SilkUniforms>({
    uSpeed: { value: speed },
    uScale: { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uColor: { value: new Color(color) },
    uRotation: { value: rotation },
    uTime: { value: 0 },
  });

  useEffect(() => {
    targetColor.current = new Color(color);
  }, [color]);

  useEffect(() => {
    uniformsRef.current.uSpeed.value = speed;
    uniformsRef.current.uScale.value = scale;
    uniformsRef.current.uNoiseIntensity.value = noiseIntensity;
    uniformsRef.current.uRotation.value = rotation;
  }, [speed, scale, noiseIntensity, rotation]);

  return (
    <Canvas dpr={[1, 2]} frameloop={isStatic ? "never" : "always"}>
      <SilkPlane ref={meshRef} uniforms={uniformsRef.current} targetColor={targetColor} />
    </Canvas>
  );
};

export default memo(Silk);
