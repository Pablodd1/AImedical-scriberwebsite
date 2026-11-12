export type ThemeMode = 'light' | 'dark';

export type InkShaderMode = 'sumi' | 'vortex' | 'watercolor' | 'burst';

export interface InkTuningParams {
  duration: number;     // ms, e.g. 1350
  tendrils: number;     // IQ domain warp multiplier, e.g. 1.85
  noiseScale: number;   // spatial frequency, e.g. 1.55
  edgeSoftness: number; // fwidth multiplier in px, default 1.4
  driftSpeed: number;   // temporal advection speed, e.g. 0.85
}

export const DEFAULT_INK_PARAMS: InkTuningParams = {
  duration: 1350,
  tendrils: 1.85,
  noiseScale: 1.55,
  edgeSoftness: 1.4,
  driftSpeed: 0.85,
};

export const MODE_INDEX_MAP: Record<InkShaderMode, number> = {
  sumi: 0,
  vortex: 1,
  watercolor: 2,
  burst: 3,
};

const VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  // Zero-VBO fullscreen triangle covering [-1, 1]^2 clip space
  vec2 pos = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  v_uv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;   // viewport CSS size (width, height)
uniform vec2 u_origin;       // click origin (clientX, clientY) from top-left
uniform float u_maxDist;     // isotropic distance from origin to farthest corner
uniform float u_progress;    // [0.0, 1.0]
uniform float u_time;        // elapsed seconds
uniform float u_tendrils;    // IQ domain-warp strength
uniform float u_noiseScale;  // spatial frequency
uniform float u_edgeSoftness;// screen-space AA width in pixels (default 1.4)
uniform float u_driftSpeed;  // temporal flow drift
uniform int u_mode;          // 0 = sumi, 1 = vortex, 2 = watercolor, 3 = burst
uniform int u_invert;        // 1 = vec3(1.0 - ink) for old group, 0 = vec3(ink) for new group

// --- 2D Simplex Noise (Ashima / Inigo Quilez) ---
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,  // (3.0 - sqrt(3.0)) / 6.0
    0.366025403784439,  // 0.5 * (sqrt(3.0) - 1.0)
   -0.577350269189626,  // -1.0 + 2.0 * C.x
    0.024390243902439   // 1.0 / 41.0
  );

  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Octave rotation matrix to break axial alignment
const mat2 OCTAVE_ROT = mat2(0.80, -0.60, 0.60, 0.80);

// 4-octave Simplex FBM mapped to [-1, 1] / [0, 1]
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amp * snoise(p);
    p = OCTAVE_ROT * p * 2.03 + vec2(13.7, 7.9);
    amp *= 0.5;
  }
  return value;
}

// Differentiable ridged calligraphy vein primitive: 1.0 - sqrt(n*n + 0.012)
float calligraphyRidge(float n) {
  return 1.0 - sqrt(n * n + 0.012);
}

float ridgedVeins(vec2 p) {
  float sum = 0.0;
  float amp = 0.56;
  float weight = 1.0;
  for (int i = 0; i < 3; i++) {
    float n = snoise(p);
    float r = calligraphyRidge(n);
    r *= r * weight;
    weight = clamp(r * 1.65, 0.15, 1.0);
    sum += r * amp;
    p = OCTAVE_ROT * p * 2.18 + vec2(4.1, 11.3);
    amp *= 0.5;
  }
  return sum;
}

void main() {
  // Strict exact boundary clamping at t = 0 and t = 1
  if (u_progress <= 0.0) {
    float outZero = (u_invert == 1) ? 1.0 : 0.0;
    fragColor = vec4(vec3(outZero), 1.0);
    return;
  }
  if (u_progress >= 1.0) {
    float outOne = (u_invert == 1) ? 0.0 : 1.0;
    fragColor = vec4(vec3(outOne), 1.0);
    return;
  }

  // Screen-space pixel coordinates matching DOM (0,0 at top-left)
  vec2 fragPx = vec2(v_uv.x * u_resolution.x, (1.0 - v_uv.y) * u_resolution.y);
  vec2 delta = fragPx - u_origin;
  float dist = length(delta);

  // Isotropic distance to farthest viewport corner
  float d0 = length(u_origin - vec2(0.0, 0.0));
  float d1 = length(u_origin - vec2(u_resolution.x, 0.0));
  float d2 = length(u_origin - vec2(0.0, u_resolution.y));
  float d3 = length(u_origin - u_resolution);
  float maxCorner = max(u_maxDist, max(max(d0, d1), max(d2, d3)));

  float minDim = max(min(u_resolution.x, u_resolution.y), 1.0);
  vec2 isoVec = delta / minDim;
  float normDist = dist / max(maxCorner, 1.0);

  // Brush-stroke velocity curve: fast capillary surge, organic deceleration
  float t = clamp(u_progress, 0.0, 1.0);
  float eased = 1.0 - pow(1.0 - t, 2.35);
  eased = mix(t * t * (3.0 - 2.0 * t), eased, 0.68);

  // Smooth boundary envelope = 0 at t=0 and t=1
  float envelope = sin(t * 3.14159265359);

  // Base domain coordinate scaled isotropically
  vec2 p = isoVec * (u_noiseScale * 2.65);
  vec2 drift = vec2(u_time * u_driftSpeed * 0.36, -u_time * u_driftSpeed * 0.27);

  // Mode-specific pre-warping of p
  float modeExtraPx = 0.0;
  float washBoost = 1.0;

  if (u_mode == 1) {
    // VORTEX: logarithmic + radial spiral swirl around click origin
    float swirlAngle = (3.6 - 1.5 * eased) * exp(-normDist * 1.45) + normDist * 2.8 - u_time * u_driftSpeed * 1.15;
    float cs = cos(swirlAngle);
    float sn = sin(swirlAngle);
    p = mat2(cs, -sn, sn, cs) * p;
  } else if (u_mode == 2) {
    // WATERCOLOR: softer wet-on-wet blossom expansion + fine paper granulation
    p *= 0.78;
    washBoost = 2.15;
  } else if (u_mode == 3) {
    // BURST: woodblock radial calligraphy spikes
    p *= 1.18;
    washBoost = 0.75;
  }

  // --- Inigo Quilez 2-Stage Domain-Warped Simplex FBM ---
  // Stage 1: q = fbm(p)
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + drift * 0.35),
    fbm(p + vec2(5.2, 1.3) - drift * 0.28)
  );

  // Stage 2: r = fbm(p + tendrils * q + drift)
  vec2 r = vec2(
    fbm(p + u_tendrils * q + vec2(1.7, 9.2) + drift),
    fbm(p + u_tendrils * q + vec2(8.3, 2.8) + drift * 0.82)
  );

  // Final warped scalar field: flow = fbm(p + tendrils * r)
  float flow = fbm(p + u_tendrils * r);

  // Differentiable ridged calligraphy veins: 1.0 - sqrt(n*n + 0.012)
  float veins = ridgedVeins(p * 1.55 + r * (0.85 + 0.35 * u_tendrils) - drift * 0.45);

  // Mode-specific radial / capillary displacement profile
  float warpAmp = maxCorner * (0.16 + 0.095 * u_tendrils) * pow(envelope, 0.55);

  if (u_mode == 0) {
    // SUMI: classic organic tendrils + capillary calligraphy veins
    modeExtraPx = warpAmp * (flow * 0.88 + (veins - 0.42) * 0.62);
  } else if (u_mode == 1) {
    // VORTEX: swirling ink arms with sharp spiral veins
    float ang = atan(delta.y, delta.x);
    float spiralArm = calligraphyRidge(sin(ang * 5.0 - normDist * 11.0 + flow * 3.2 - u_time * u_driftSpeed * 1.8));
    modeExtraPx = warpAmp * (flow * 0.82 + (spiralArm - 0.45) * 0.58 + (veins - 0.4) * 0.42);
  } else if (u_mode == 2) {
    // WATERCOLOR: feathered cauliflower blooms + kozo paper micro-grain
    float blossom = fbm(p * 0.65 - 1.35 * r + drift * 0.5);
    float paperGrain = snoise(fragPx * 0.085 + q * 2.0) * 0.08;
    modeExtraPx = warpAmp * (flow * 0.95 + blossom * 0.65 + (veins - 0.45) * 0.32 + paperGrain);
  } else {
    // BURST: radial woodblock splatter spikes using differentiable ridge harmonics
    float ang = atan(delta.y, delta.x);
    float warpedAng = ang + flow * 0.52 + q.x * 0.32;
    float raysA = calligraphyRidge(sin(warpedAng * 14.0 + u_time * u_driftSpeed * 0.6));
    float raysB = calligraphyRidge(sin(warpedAng * 29.0 - q.y * 4.0 - u_time * u_driftSpeed * 0.9));
    float spikeField = raysA * 0.68 + raysB * 0.38;
    modeExtraPx = warpAmp * 1.28 * ((spikeField - 0.46) * 0.92 + flow * 0.48 + (veins - 0.42) * 0.36);
  }

  // Sweep advancing radius cleanly from behind origin (-leadMargin) past farthest corner (+tailMargin)
  float sweepMargin = maxCorner * (0.24 + 0.11 * u_tendrils);
  float baseRadius = mix(-sweepMargin * 0.22, maxCorner + sweepMargin, eased);

  // Signed field in screen pixels (> 0 inside ink, < 0 outside ink)
  float signedField = baseRadius + modeExtraPx - dist;

  // Screen-space pixel-accurate anti-aliasing via fwidth(signedField)
  float fw = max(fwidth(signedField), 1e-4);
  float aaWidth = fw * max(u_edgeSoftness, 0.2);
  float coreInk = smoothstep(-aaWidth, aaWidth, signedField);

  // Smoky frontier calligraphy wash wicking ahead of dense ink core
  float washWidth = maxCorner * 0.055 * washBoost * envelope + aaWidth * 3.0;
  float frontierRamp = smoothstep(-washWidth, aaWidth * 0.5, signedField);
  float washTexture = clamp(0.35 + 0.65 * veins * (0.65 + 0.5 * flow), 0.0, 1.0);
  float smokyWash = frontierRamp * frontierRamp * washTexture * (u_mode == 2 ? 0.58 : 0.38) * envelope;

  // Interior subtle wet-ink sheen modulation that settles cleanly to 1.0 as frontier passes
  float ink = clamp(max(coreInk, smokyWash), 0.0, 1.0);

  float outVal = (u_invert == 1) ? (1.0 - ink) : ink;
  fragColor = vec4(vec3(outVal), 1.0);
}
`;

interface WebGLInkPass {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  uniforms: {
    resolution: WebGLUniformLocation | null;
    origin: WebGLUniformLocation | null;
    maxDist: WebGLUniformLocation | null;
    progress: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    tendrils: WebGLUniformLocation | null;
    noiseScale: WebGLUniformLocation | null;
    edgeSoftness: WebGLUniformLocation | null;
    driftSpeed: WebGLUniformLocation | null;
    mode: WebGLUniformLocation | null;
    invert: WebGLUniformLocation | null;
  };
  dispose: () => void;
}

const isSoftwareWebGL = (() => {
  if (typeof document === 'undefined') return false;
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to allocate WebGL2 shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'Unknown shader compile error';
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createWebGLInkPass(width: number, height: number, dpr: number, invert: boolean): WebGLInkPass | null {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.mixBlendMode = 'multiply';
  canvas.style.pointerEvents = 'none';
  canvas.style.display = 'block';

  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });

  if (!gl) return null;

  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL2 program');

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) || 'Unknown link error';
      gl.deleteProgram(program);
      throw new Error(log);
    }

    const vao = gl.createVertexArray();
    if (!vao) throw new Error('Failed to create VAO');

    gl.useProgram(program);
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      origin: gl.getUniformLocation(program, 'u_origin'),
      maxDist: gl.getUniformLocation(program, 'u_maxDist'),
      progress: gl.getUniformLocation(program, 'u_progress'),
      time: gl.getUniformLocation(program, 'u_time'),
      tendrils: gl.getUniformLocation(program, 'u_tendrils'),
      noiseScale: gl.getUniformLocation(program, 'u_noiseScale'),
      edgeSoftness: gl.getUniformLocation(program, 'u_edgeSoftness'),
      driftSpeed: gl.getUniformLocation(program, 'u_driftSpeed'),
      mode: gl.getUniformLocation(program, 'u_mode'),
      invert: gl.getUniformLocation(program, 'u_invert'),
    };

    gl.uniform1i(uniforms.invert, invert ? 1 : 0);

    const dispose = () => {
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };

    return { canvas, gl, program, vao, uniforms, dispose };
  } catch (err) {
    console.error('[InkBleedEngine] WebGL2 initialization error:', err);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
}

function renderPass(
  pass: WebGLInkPass,
  width: number,
  height: number,
  originX: number,
  originY: number,
  maxDist: number,
  progress: number,
  elapsedSec: number,
  mode: InkShaderMode,
  params: InkTuningParams
) {
  const { gl, program, vao, uniforms, canvas } = pass;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  gl.bindVertexArray(vao);

  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform2f(uniforms.origin, originX, originY);
  gl.uniform1f(uniforms.maxDist, maxDist);
  gl.uniform1f(uniforms.progress, progress);
  gl.uniform1f(uniforms.time, elapsedSec);
  gl.uniform1f(uniforms.tendrils, params.tendrils);
  gl.uniform1f(uniforms.noiseScale, params.noiseScale);
  gl.uniform1f(uniforms.edgeSoftness, params.edgeSoftness);
  gl.uniform1f(uniforms.driftSpeed, params.driftSpeed);
  gl.uniform1i(uniforms.mode, MODE_INDEX_MAP[mode]);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * Optional hook allowing live WebGL/Three.js viewports inside #page-root
 * to synchronously render a theme-accurate frame right before canvas bitmap cloning.
 */
type ThemeCanvasRenderer = (theme: ThemeMode) => void;
const themeCanvasRenderers = new Set<ThemeCanvasRenderer>();

export function registerThemeCanvasRenderer(fn: ThemeCanvasRenderer): () => void {
  themeCanvasRenderers.add(fn);
  return () => {
    themeCanvasRenderers.delete(fn);
  };
}

function captureCanvasBitmaps(root: HTMLElement): HTMLCanvasElement[] {
  const liveCanvases = Array.from(root.querySelectorAll('canvas'));
  return liveCanvases.map((src) => {
    const copy = document.createElement('canvas');
    copy.width = Math.max(1, src.width);
    copy.height = Math.max(1, src.height);
    const ctx = copy.getContext('2d');
    if (ctx && src.width > 0 && src.height > 0) {
      try {
        ctx.drawImage(src, 0, 0);
      } catch {
        // Ignore tainted or zero-sized canvas
      }
    }
    return copy;
  });
}

function captureVideoBitmaps(root: HTMLElement): Array<HTMLCanvasElement | null> {
  const liveVideos = Array.from(root.querySelectorAll('video'));
  return liveVideos.map((vid) => {
    const w = vid.videoWidth || vid.clientWidth || 0;
    const h = vid.videoHeight || vid.clientHeight || 0;
    if (w <= 0 || h <= 0 || vid.readyState < 2) return null;
    const copy = document.createElement('canvas');
    copy.width = w;
    copy.height = h;
    const ctx = copy.getContext('2d');
    if (ctx) {
      try {
        ctx.drawImage(vid, 0, 0, w, h);
        return copy;
      } catch {
        return null;
      }
    }
    return null;
  });
}

function createSyncedPageClone(
  sourceRoot: HTMLElement,
  theme: ThemeMode,
  scrollX: number,
  scrollY: number,
  canvasSnapshots: HTMLCanvasElement[],
  videoSnapshots: Array<HTMLCanvasElement | null>
): HTMLElement {
  const clone = sourceRoot.cloneNode(true) as HTMLElement;

  // Prevent duplicate #page-root or child IDs while preserving all classes & data attributes
  clone.removeAttribute('id');
  clone.setAttribute('data-theme', theme);
  clone.setAttribute('data-ink-clone', 'true');
  clone.setAttribute('aria-hidden', 'true');

  const elementsWithId = clone.querySelectorAll('[id]');
  elementsWithId.forEach((el) => el.removeAttribute('id'));

  // Sync live form control values (input, textarea, select)
  const srcInputs = sourceRoot.querySelectorAll('input');
  const cloneInputs = clone.querySelectorAll('input');
  srcInputs.forEach((srcEl, i) => {
    const dstEl = cloneInputs[i];
    if (!dstEl) return;
    dstEl.value = srcEl.value;
    dstEl.setAttribute('value', srcEl.value);
    dstEl.checked = srcEl.checked;
    if (srcEl.checked) dstEl.setAttribute('checked', '');
    else dstEl.removeAttribute('checked');
  });

  const srcTextareas = sourceRoot.querySelectorAll('textarea');
  const cloneTextareas = clone.querySelectorAll('textarea');
  srcTextareas.forEach((srcEl, i) => {
    const dstEl = cloneTextareas[i];
    if (!dstEl) return;
    dstEl.value = srcEl.value;
    dstEl.textContent = srcEl.value;
  });

  const srcSelects = sourceRoot.querySelectorAll('select');
  const cloneSelects = clone.querySelectorAll('select');
  srcSelects.forEach((srcEl, i) => {
    const dstEl = cloneSelects[i];
    if (!dstEl) return;
    dstEl.selectedIndex = srcEl.selectedIndex;
  });

  // Sync nested scrollable containers
  const srcScrollables = sourceRoot.querySelectorAll('[data-sync-scroll]');
  const cloneScrollables = clone.querySelectorAll('[data-sync-scroll]');
  srcScrollables.forEach((srcEl, i) => {
    const dstEl = cloneScrollables[i] as HTMLElement | undefined;
    if (!dstEl) return;
    dstEl.scrollTop = (srcEl as HTMLElement).scrollTop;
    dstEl.scrollLeft = (srcEl as HTMLElement).scrollLeft;
  });

  // Paint captured WebGL / 2D canvas bitmaps into cloned <canvas> nodes
  const clonedCanvases = clone.querySelectorAll('canvas');
  clonedCanvases.forEach((dstCanvas, i) => {
    const snap = canvasSnapshots[i];
    if (!snap) return;
    dstCanvas.width = snap.width;
    dstCanvas.height = snap.height;
    const ctx = dstCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(snap, 0, 0);
    }
  });

  // Replace cloned <video> elements with exact pixel-synced frame snapshots to prevent black flashes
  const clonedVideos = clone.querySelectorAll('video');
  clonedVideos.forEach((dstVid, i) => {
    const vSnap = videoSnapshots[i];
    if (!vSnap || !dstVid.parentNode) return;
    vSnap.className = dstVid.className;
    vSnap.style.cssText = dstVid.style.cssText;
    dstVid.parentNode.replaceChild(vSnap, dstVid);
  });

  // Position clone to match exact viewport scroll offset
  clone.style.position = 'absolute';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.width = `${sourceRoot.offsetWidth || window.innerWidth}px`;
  clone.style.minHeight = '100vh';
  clone.style.transform = `translate3d(${-scrollX}px, ${-scrollY}px, 0)`;
  clone.style.willChange = 'transform';
  clone.style.pointerEvents = 'none';

  return clone;
}

export interface InkTransitionRunOptions {
  originX: number;
  originY: number;
  oldTheme: ThemeMode;
  newTheme: ThemeMode;
  getMode: () => InkShaderMode;
  getParams: () => InkTuningParams;
  applyThemeToLiveDOM: (theme: ThemeMode) => void;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export class InkBleedTransitionController {
  private activeCleanup: (() => void) | null = null;
  private lastOrigin: { x: number; y: number } | null = null;

  public getLastOrigin(): { x: number; y: number } {
    if (this.lastOrigin) return this.lastOrigin;
    return {
      x: Math.round(window.innerWidth * 0.5),
      y: Math.round(window.innerHeight * 0.35),
    };
  }

  public isRunning(): boolean {
    return this.activeCleanup !== null;
  }

  public cancelActive(): void {
    if (this.activeCleanup) {
      const fn = this.activeCleanup;
      this.activeCleanup = null;
      fn();
    }
  }

  public trigger(opts: InkTransitionRunOptions): void {
    // Clean up any in-flight stage immediately
    this.cancelActive();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const originX = Math.max(0, Math.min(width, opts.originX));
    const originY = Math.max(0, Math.min(height, opts.originY));
    this.lastOrigin = { x: originX, y: originY };

    const pageRoot = document.getElementById('page-root');
    if (!pageRoot) {
      opts.applyThemeToLiveDOM(opts.newTheme);
      opts.onComplete?.();
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const dpr = isSoftwareWebGL ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    // 1. Snapshot live canvases & video frames in oldTheme before mutating live DOM
    themeCanvasRenderers.forEach((renderFn) => renderFn(opts.oldTheme));
    const oldCanvasSnaps = captureCanvasBitmaps(pageRoot);
    const oldVideoSnaps = captureVideoBitmaps(pageRoot);
    const oldClone = createSyncedPageClone(
      pageRoot,
      opts.oldTheme,
      scrollX,
      scrollY,
      oldCanvasSnaps,
      oldVideoSnaps
    );

    // 2. Switch live #page-root immediately underneath our fullscreen stage, then snapshot newTheme
    opts.applyThemeToLiveDOM(opts.newTheme);
    themeCanvasRenderers.forEach((renderFn) => renderFn(opts.newTheme));
    const newCanvasSnaps = captureCanvasBitmaps(pageRoot);
    const newVideoSnaps = captureVideoBitmaps(pageRoot);
    const newClone = createSyncedPageClone(
      pageRoot,
      opts.newTheme,
      scrollX,
      scrollY,
      newCanvasSnaps,
      newVideoSnaps
    );

    // 3. Allocate the two WebGL2 mask passes
    const oldPass = createWebGLInkPass(width, height, dpr, true);  // vec3(1.0 - ink)
    const newPass = createWebGLInkPass(width, height, dpr, false); // vec3(ink)

    if (!oldPass || !newPass) {
      oldPass?.dispose();
      newPass?.dispose();
      opts.onComplete?.();
      return;
    }

    // Isotropic distance from (originX, originY) to farthest viewport corner
    const maxDist = Math.max(
      Math.hypot(originX, originY),
      Math.hypot(width - originX, originY),
      Math.hypot(originX, height - originY),
      Math.hypot(width - originX, height - originY)
    );

    // 4. Mount fixed fullscreen GPU compositing stage (isolation: isolate; background: #000)
    const stage = document.createElement('div');
    stage.setAttribute('data-ink-stage', 'true');
    stage.style.position = 'fixed';
    stage.style.inset = '0';
    stage.style.zIndex = '9990';
    stage.style.pointerEvents = 'none';
    stage.style.isolation = 'isolate';
    stage.style.background = '#000000';
    stage.style.overflow = 'hidden';

    // Group A: Old-theme DOM clone beneath WebGL2 canvas outputting vec3(1.0 - ink) with multiply
    const oldGroup = document.createElement('div');
    oldGroup.style.position = 'absolute';
    oldGroup.style.inset = '0';
    oldGroup.style.isolation = 'isolate';
    oldGroup.style.overflow = 'hidden';
    oldGroup.style.backgroundColor = opts.oldTheme === 'dark' ? '#070d17' : '#f8f9ff';
    oldGroup.appendChild(oldClone);
    oldGroup.appendChild(oldPass.canvas);

    // Group B: New-theme DOM clone (plus-lighter) beneath WebGL2 canvas outputting vec3(ink) with multiply
    const newGroup = document.createElement('div');
    newGroup.style.position = 'absolute';
    newGroup.style.inset = '0';
    newGroup.style.isolation = 'isolate';
    newGroup.style.mixBlendMode = 'plus-lighter';
    newGroup.style.overflow = 'hidden';
    newGroup.style.backgroundColor = opts.newTheme === 'dark' ? '#070d17' : '#f8f9ff';
    newGroup.appendChild(newClone);
    newGroup.appendChild(newPass.canvas);

    stage.appendChild(oldGroup);
    stage.appendChild(newGroup);

    // Render initial t = 0 frame BEFORE mounting stage so first painted frame is strictly progress = 0.0
    const initialParams = opts.getParams();
    const initialMode = opts.getMode();
    renderPass(oldPass, width, height, originX, originY, maxDist, 0.0, 0.0, initialMode, initialParams);
    renderPass(newPass, width, height, originX, originY, maxDist, 0.0, 0.0, initialMode, initialParams);

    document.body.appendChild(stage);

    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    const startTime = performance.now();

    const handleScrollSync = () => {
      const sx = window.scrollX;
      const sy = window.scrollY;
      const transform = `translate3d(${-sx}px, ${-sy}px, 0)`;
      oldClone.style.transform = transform;
      newClone.style.transform = transform;
    };
    window.addEventListener('scroll', handleScrollSync, { passive: true });

    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener('scroll', handleScrollSync);
      if (stage.parentNode) {
        stage.parentNode.removeChild(stage);
      }
      oldPass.dispose();
      newPass.dispose();
      if (this.activeCleanup === cleanup) {
        this.activeCleanup = null;
      }
    };

    this.activeCleanup = cleanup;

    const scheduleNext = (cb: () => void) => {
      if (isSoftwareWebGL) {
        const gl = newPass.gl;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timerId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timerId = window.setTimeout(cb, 32);
          }
        };
        timerId = window.setTimeout(poll, 5);
      } else {
        rafId = requestAnimationFrame(cb);
      }
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const params = opts.getParams();
      const mode = opts.getMode();
      const durationMs = Math.max(200, params.duration);
      const elapsedMs = Math.max(0, now - startTime);
      const rawProgress = Math.min(1.0, elapsedMs / durationMs);
      const elapsedSec = elapsedMs * 0.001;

      const curW = window.innerWidth;
      const curH = window.innerHeight;
      const curDpr = isSoftwareWebGL ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const targetPxW = Math.max(1, Math.round(curW * curDpr));
      const targetPxH = Math.max(1, Math.round(curH * curDpr));
      if (oldPass.canvas.width !== targetPxW || oldPass.canvas.height !== targetPxH) {
        oldPass.canvas.width = targetPxW;
        oldPass.canvas.height = targetPxH;
        newPass.canvas.width = targetPxW;
        newPass.canvas.height = targetPxH;
      }

      renderPass(oldPass, curW, curH, originX, originY, maxDist, rawProgress, elapsedSec, mode, params);
      renderPass(newPass, curW, curH, originX, originY, maxDist, rawProgress, elapsedSec, mode, params);
      opts.onProgress?.(rawProgress);

      if (rawProgress >= 1.0) {
        // Remove the stage immediately as soon as progress === 1
        cleanup();
        opts.onComplete?.();
        return;
      }

      scheduleNext(tick);
    };

    scheduleNext(tick);
  }
}

export const inkBleedController = new InkBleedTransitionController();
