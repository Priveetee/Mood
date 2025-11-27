"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";
import { usePerfMode } from "./context";

interface BaseProps {
  children?: React.ReactNode;
}

type PerfMotionProps = MotionProps &
  BaseProps & {
    as?: React.ElementType<BaseProps>;
  };

export function PerfMotion({
  as: Component = "div",
  children,
  ...motionProps
}: PerfMotionProps) {
  const { effectiveMode } = usePerfMode();

  const TypedComponent = Component as React.ComponentType<BaseProps>;

  if (effectiveMode === "low") {
    return <TypedComponent {...motionProps}>{children}</TypedComponent>;
  }

  const MotionComponent = motion(TypedComponent);

  return <MotionComponent {...motionProps}>{children}</MotionComponent>;
}
