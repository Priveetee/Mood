"use client";

import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import { mountFaultyTerminal, type Vec2 } from "./faulty-terminal-engine";
import { hexToRgb } from "./faulty-terminal-utils";

export interface FaultyTerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number;
  gridMul?: Vec2;
  digitSize?: number;
  timeScale?: number;
  pause?: boolean;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number | boolean;
  curvature?: number;
  tint?: string;
  mouseReact?: boolean;
  mouseStrength?: number;
  dpr?: number;
  pageLoadAnimation?: boolean;
  brightness?: number;
}

export default function FaultyTerminal({
  scale = 1,
  gridMul = [2, 1],
  digitSize = 1.5,
  timeScale = 0.3,
  pause = false,
  scanlineIntensity = 0.3,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0.2,
  tint = "#ffffff",
  mouseReact = true,
  mouseStrength = 0.2,
  dpr = 2,
  pageLoadAnimation = true,
  brightness = 1,
  className,
  style,
  ...rest
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tintVec = useMemo(() => hexToRgb(tint), [tint]);
  const ditherValue = useMemo(
    () => (typeof dither === "boolean" ? (dither ? 1 : 0) : dither),
    [dither],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    return mountFaultyTerminal(containerRef.current, {
      dpr,
      scale,
      gridMul,
      digitSize,
      timeScale,
      pause,
      scanlineIntensity,
      glitchAmount,
      flickerAmount,
      noiseAmp,
      chromaticAberration,
      ditherValue,
      curvature,
      tintVec,
      mouseStrength,
      mouseReact,
      pageLoadAnimation,
      brightness,
    });
  }, [
    dpr,
    scale,
    gridMul,
    digitSize,
    timeScale,
    pause,
    scanlineIntensity,
    glitchAmount,
    flickerAmount,
    noiseAmp,
    chromaticAberration,
    ditherValue,
    curvature,
    tintVec,
    mouseStrength,
    mouseReact,
    pageLoadAnimation,
    brightness,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className || ""}`}
      style={style}
      {...rest}
    />
  );
}
