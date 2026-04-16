"use client";

/* eslint-disable react-hooks/static-components */

import { type MotionProps, motion } from "framer-motion";
import type React from "react";
import { useMemo } from "react";
import { usePerfMode } from "./perf-mode-context";

interface BaseProps {
  children?: React.ReactNode;
}

type PerfMotionProps = MotionProps &
  BaseProps & {
    as?: React.ElementType<BaseProps>;
  };

export function PerfMotion({ as: Component = "div", children, ...motionProps }: PerfMotionProps) {
  const { effectiveMode } = usePerfMode();

  const TypedComponent = useMemo(() => Component as React.ComponentType<BaseProps>, [Component]);

  const MotionComponent = useMemo(() => motion(TypedComponent), [TypedComponent]);

  if (effectiveMode === "low") {
    return <TypedComponent {...motionProps}>{children}</TypedComponent>;
  }

  return <MotionComponent {...motionProps}>{children}</MotionComponent>;
}
