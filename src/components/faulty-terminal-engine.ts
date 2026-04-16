import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import {
  faultyTerminalFragmentShader,
  faultyTerminalVertexShader,
} from "./faulty-terminal-shaders";

export type Vec2 = [number, number];

type FaultyTerminalEngineOptions = {
  dpr: number;
  scale: number;
  gridMul: Vec2;
  digitSize: number;
  timeScale: number;
  pause: boolean;
  scanlineIntensity: number;
  glitchAmount: number;
  flickerAmount: number;
  noiseAmp: number;
  chromaticAberration: number;
  ditherValue: number;
  curvature: number;
  tintVec: [number, number, number];
  mouseStrength: number;
  mouseReact: boolean;
  pageLoadAnimation: boolean;
  brightness: number;
};

function createUniforms(gl: WebGLRenderingContext, options: FaultyTerminalEngineOptions) {
  return {
    iTime: { value: 0 },
    iResolution: {
      value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
    },
    uScale: { value: options.scale },
    uGridMul: { value: new Float32Array(options.gridMul) },
    uDigitSize: { value: options.digitSize },
    uScanlineIntensity: { value: options.scanlineIntensity },
    uGlitchAmount: { value: options.glitchAmount },
    uFlickerAmount: { value: options.flickerAmount },
    uNoiseAmp: { value: options.noiseAmp },
    uChromaticAberration: { value: options.chromaticAberration },
    uDither: { value: options.ditherValue },
    uCurvature: { value: options.curvature },
    uTint: { value: new Color(options.tintVec[0], options.tintVec[1], options.tintVec[2]) },
    uMouse: { value: new Float32Array([0.5, 0.5]) },
    uMouseStrength: { value: options.mouseStrength },
    uUseMouse: { value: options.mouseReact ? 1 : 0 },
    uPageLoadProgress: { value: options.pageLoadAnimation ? 0 : 1 },
    uUsePageLoadAnimation: { value: options.pageLoadAnimation ? 1 : 0 },
    uBrightness: { value: options.brightness },
  };
}

export function mountFaultyTerminal(
  container: HTMLDivElement,
  options: FaultyTerminalEngineOptions,
) {
  const renderer = new Renderer({ dpr: options.dpr });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 1);
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: faultyTerminalVertexShader,
    fragment: faultyTerminalFragmentShader,
    uniforms: createUniforms(gl, options),
  });
  const mesh = new Mesh(gl, { geometry, program });
  let raf = 0;
  let start = 0;

  const resize = () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    program.uniforms.iResolution.value = new Color(
      gl.canvas.width,
      gl.canvas.height,
      gl.canvas.width / gl.canvas.height,
    );
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  const loop = (time: number) => {
    raf = requestAnimationFrame(loop);
    if (start === 0) {
      start = time;
    }
    if (!options.pause) {
      program.uniforms.iTime.value = time * 0.001 * options.timeScale;
    }
    if (options.pageLoadAnimation) {
      const progress = Math.min((time - start) / 2000, 1);
      program.uniforms.uPageLoadProgress.value = progress;
    }
    renderer.render({ scene: mesh });
  };

  raf = requestAnimationFrame(loop);
  container.appendChild(gl.canvas);

  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    if (gl.canvas.parentElement === container) {
      container.removeChild(gl.canvas);
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
