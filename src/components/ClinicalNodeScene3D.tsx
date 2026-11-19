import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { registerThemeCanvasRenderer, ThemeMode } from '../engine/inkBleedEngine';

let rectAreaUniformsInitialized = false;

export type NodeCameraPreset = 'overview' | 'overhead' | 'transducer' | 'subnodes';
export type ChassisFinish = 'titanium' | 'ceramic' | 'obsidian';

interface PresetSpec {
  label: string;
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<NodeCameraPreset, PresetSpec> = {
  overview: {
    label: 'Overview 3/4',
    pos: [4.1, 2.85, 4.55],
    target: [0, 0.78, 0],
  },
  overhead: {
    label: 'Topology Plan',
    pos: [0.02, 5.9, 0.7],
    target: [0, 0.45, 0],
  },
  transducer: {
    label: 'Acoustic Array',
    pos: [1.95, 1.55, 2.2],
    target: [0, 0.68, 0],
  },
  subnodes: {
    label: 'Review ring',
    pos: [-4.5, 1.85, 2.1],
    target: [0, 0.85, 0],
  },
};

// Pre-allocated scratch math helpers (Zero GC in render loop)
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _camGoal = new THREE.Vector3();
const _targetGoal = new THREE.Vector3();

const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

function createBrushedMetalRoughnessMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y++) {
    const v = 112 + Math.sin(y * 0.35) * 14 + ((y * 53) % 19) - 9;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createTelemetryDialTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(13, 148, 136, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 198, 0, Math.PI * 2);
  ctx.stroke();

  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const major = deg % 45 === 0;
    const mid = deg % 15 === 0;
    const r0 = major ? 202 : mid ? 216 : 226;
    const r1 = 239;
    ctx.strokeStyle = major ? '#14b8a6' : 'rgba(20, 184, 166, 0.55)';
    ctx.lineWidth = major ? 2.6 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r0, cy + Math.sin(rad) * r0);
    ctx.lineTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.stroke();
  }

  const labels = ['AI SCRIBE', 'EHR & OCR', 'ENCODING', 'OFFICE ALLY'];
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#14b8a6';
  ctx.textAlign = 'center';
  labels.forEach((lbl, idx) => {
    const angle = (idx * Math.PI) / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * 176, cy + Math.sin(angle) * 176);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(lbl, 0, 0);
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
  grad.addColorStop(0, 'rgba(6, 15, 28, 0.58)');
  grad.addColorStop(0.55, 'rgba(6, 15, 28, 0.24)');
  grad.addColorStop(1, 'rgba(6, 15, 28, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function createOctagonShape(radius: number, bevelRadius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const sides = 8;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 + Math.PI / 8;
    pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
  }
  for (let i = 0; i < sides; i++) {
    const prev = pts[(i - 1 + sides) % sides];
    const curr = pts[i];
    const next = pts[(i + 1) % sides];
    const d1 = prev.clone().sub(curr).normalize().multiplyScalar(bevelRadius);
    const d2 = next.clone().sub(curr).normalize().multiplyScalar(bevelRadius);
    const pStart = curr.clone().add(d1);
    const pEnd = curr.clone().add(d2);
    if (i === 0) shape.moveTo(pStart.x, pStart.y);
    else shape.lineTo(pStart.x, pStart.y);
    shape.quadraticCurveTo(curr.x, curr.y, pEnd.x, pEnd.y);
  }
  shape.closePath();
  return shape;
}

interface ClinicalNodeScene3DProps {
  theme: ThemeMode;
}

export const ClinicalNodeScene3D: React.FC<ClinicalNodeScene3DProps> = ({ theme }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [exploded, setExploded] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<NodeCameraPreset>('overview');
  const [finish, setFinish] = useState<ChassisFinish>('titanium');
  const [streamRate, setStreamRate] = useState<'idle' | 'active' | 'burst'>('active');

  const stateRef = useRef({
    theme,
    exploded: 0,
    cameraPreset: 'overview' as NodeCameraPreset,
    animateCamera: false,
    finish: 'titanium' as ChassisFinish,
    streamRate: 'active' as 'idle' | 'active' | 'burst',
  });

  useEffect(() => {
    stateRef.current.theme = theme;
  }, [theme]);

  useEffect(() => {
    stateRef.current.exploded = exploded;
  }, [exploded]);

  useEffect(() => {
    stateRef.current.finish = finish;
  }, [finish]);

  useEffect(() => {
    stateRef.current.streamRate = streamRate;
  }, [streamRate]);

  const selectPreset = (key: NodeCameraPreset) => {
    setCameraPreset(key);
    stateRef.current.cameraPreset = key;
    stateRef.current.animateCamera = true;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = Math.max(320, container.clientWidth);
    const height = Math.max(360, container.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initBg = stateRef.current.theme === 'dark' ? 0x070d17 : 0xf1f5fd;
    scene.background = new THREE.Color(initBg);
    scene.fog = new THREE.FogExp2(initBg, 0.045);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(...CAMERA_PRESETS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.overview.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.minDistance = 2.2;
    controls.maxDistance = 10.0;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.update();

    const onCtrlStart = () => {
      stateRef.current.animateCamera = false;
    };
    controls.addEventListener('start', onCtrlStart);

    // Studio 3-Point Warm/Cool Lighting + Softbox
    const keyLight = new THREE.DirectionalLight(0xfff4e4, 2.35);
    keyLight.position.set(4.8, 7.0, 3.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    const d = 4.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 16.0;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xdff9f6, 0x1e293b, 0.9);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x5eead4, 1.35);
    rimLight.position.set(-4.6, 3.4, -4.2);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      if (!rectAreaUniformsInitialized) {
        RectAreaLightUniformsLib.init();
        rectAreaUniformsInitialized = true;
      }
      const softbox = new THREE.RectAreaLight(0xf0fdfa, 3.0, 3.4, 1.8);
      softbox.position.set(-2.8, 4.0, 3.2);
      softbox.lookAt(0, 0.75, 0);
      scene.add(softbox);
    }

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const metalRoughTex = createBrushedMetalRoughnessMap();
    const dialTex = createTelemetryDialTexture(maxAniso);
    const shadowTex = createContactShadowTexture();

    const disposables: Array<{ dispose: () => void }> = [envMap, metalRoughTex, dialTex, shadowTex];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposables.push(m);
      return m;
    };

    // Clinical Studio Floor Plane (y = 0)
    const floorMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: stateRef.current.theme === 'dark' ? 0x0a1220 : 0xe6eefb,
        roughness: 0.88,
        metalness: 0.05,
      })
    );
    const floorMesh = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(20, 64)), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // =========================================================================
    // COMPOSITE 10-PART PROCEDURAL AIMS AMBIENT SCRIBE & SUBNODE ARRAY (y = 0)
    // =========================================================================
    const rootRig = new THREE.Group();
    rootRig.position.set(0, 0, 0);
    scene.add(rootRig);

    // Part 1: Turned Medical-Grade Pedestal Plinth (LatheGeometry, y = 0..0.22)
    const plinthProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(2.45, 0.0),
      new THREE.Vector2(2.42, 0.05),
      new THREE.Vector2(2.22, 0.09),
      new THREE.Vector2(2.16, 0.18),
      new THREE.Vector2(2.04, 0.22),
      new THREE.Vector2(0.0, 0.22),
    ];
    const plinthMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.72,
        metalness: 0.22,
      })
    );
    const plinthMesh = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(plinthProfile, 64)), plinthMat);
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    rootRig.add(plinthMesh);

    // Part 2: Grounded Radial Contact Shadow Plane (y = 0.223)
    const contactMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    const contactPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(3.8, 3.8)), contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.223;
    rootRig.add(contactPlane);

    // Part 3: Engraved Subnode Telemetry Calibration Ring (y = 0.225)
    const dialMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: dialTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    const dialPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(3.95, 3.95)), dialMat);
    dialPlane.rotation.x = -Math.PI / 2;
    dialPlane.position.y = 0.225;
    rootRig.add(dialPlane);

    // Part 4: Beveled Octagonal Acoustic Scribe Core Chassis (ExtrudeGeometry)
    const chassisGroup = new THREE.Group();
    chassisGroup.position.set(0, 0.22, 0);
    rootRig.add(chassisGroup);

    const chassisShape = createOctagonShape(1.18, 0.14);
    const rawChassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
      depth: 0.26,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
    });
    rawChassisGeo.rotateX(-Math.PI / 2);
    rawChassisGeo.translate(0, 0.04, 0);
    const chassisGeo = trackGeo(mergeVertices(rawChassisGeo));
    rawChassisGeo.dispose();
    if (chassisGeo.index && chassisGeo.attributes.uv && chassisGeo.attributes.normal) {
      chassisGeo.computeTangents();
    }

    const chassisMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xdbe4f0,
        metalness: 0.88,
        roughness: 0.22,
        roughnessMap: metalRoughTex,
        anisotropy: 0.82,
        clearcoat: 0.35,
      })
    );
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    chassisGroup.add(chassisMesh);

    // Anodized Clinical-Teal Collar Bezel
    const bezelShape = createOctagonShape(1.04, 0.12);
    const bezelHole = new THREE.Path();
    bezelHole.absarc(0, 0, 0.78, 0, Math.PI * 2, true);
    bezelShape.holes.push(bezelHole);
    const bezelGeo = trackGeo(
      new THREE.ExtrudeGeometry(bezelShape, {
        depth: 0.07,
        bevelEnabled: true,
        bevelThickness: 0.016,
        bevelSize: 0.016,
        bevelSegments: 3,
      })
    );
    bezelGeo.rotateX(-Math.PI / 2);
    bezelGeo.translate(0, 0.31, 0);

    const tealMetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x0d9488,
        metalness: 0.82,
        roughness: 0.2,
        clearcoat: 0.65,
        clearcoatRoughness: 0.12,
      })
    );
    const bezelMesh = new THREE.Mesh(bezelGeo, tealMetalMat);
    bezelMesh.castShadow = true;
    chassisGroup.add(bezelMesh);

    // Part 5: Illustrated Acoustic Wave Transducer Pool (onBeforeCompile PBR ripple membrane)
    const transducerGroup = new THREE.Group();
    transducerGroup.position.set(0, 0.56, 0);
    rootRig.add(transducerGroup);

    // Subdivide radial disc for smooth ripples
    const radialDiscGeo = trackGeo(new THREE.RingGeometry(0.001, 0.77, 64, 28));
    radialDiscGeo.rotateX(-Math.PI / 2);

    const transducerMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x06373a,
        emissive: new THREE.Color(0x0d9488),
        emissiveIntensity: 0.24,
        roughness: 0.08,
        metalness: 0.38,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
      })
    );
    transducerMat.onBeforeCompile = (shader) => {
      shader.uniforms.uAcousticTime = { value: 0 };
      transducerMat.userData.shader = shader;
      shader.vertexShader = 'uniform float uAcousticTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float rD = length(transformed.xz);
        transformed.y += sin(rD * 24.0 - uAcousticTime * 4.2) * exp(-rD * 2.1) * 0.018;
        `
      );
    };
    const transducerMesh = new THREE.Mesh(radialDiscGeo, transducerMat);
    transducerGroup.add(transducerMesh);

    // Part 6: Optical Sapphire Acoustic Lens Dome (MeshPhysicalMaterial transmission)
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 0.58, 0);
    rootRig.add(domeGroup);

    const domeProfile = [
      new THREE.Vector2(0.79, 0.0),
      new THREE.Vector2(0.77, 0.14),
      new THREE.Vector2(0.68, 0.31),
      new THREE.Vector2(0.49, 0.45),
      new THREE.Vector2(0.24, 0.54),
      new THREE.Vector2(0.0, 0.57),
    ];
    const domeMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xeffefa,
        metalness: 0.0,
        roughness: 0.04,
        transmission: isSoftwareGl ? 0 : 0.92,
        transparent: true,
        opacity: isSoftwareGl ? 0.36 : 1.0,
        ior: 1.58,
        thickness: 1.1,
        attenuationColor: new THREE.Color(0x99f6e4),
        attenuationDistance: 2.2,
        clearcoat: 1.0,
        depthWrite: false,
      })
    );
    const domeMesh = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(domeProfile, 48)), domeMat);
    domeMesh.renderOrder = 3;
    domeGroup.add(domeMesh);

    // Part 7: Four Architectural Service Subnode Pylons (Ports 4000, 3456, 3457, 3458)
    const pylonsGroup = new THREE.Group();
    pylonsGroup.position.set(0, 0.22, 0);
    rootRig.add(pylonsGroup);

    const pylonShape = new THREE.Shape();
    pylonShape.moveTo(-0.14, -0.09);
    pylonShape.lineTo(0.14, -0.09);
    pylonShape.lineTo(0.11, 0.09);
    pylonShape.lineTo(-0.11, 0.09);
    pylonShape.closePath();

    const pylonGeo = trackGeo(
      new THREE.ExtrudeGeometry(pylonShape, {
        depth: 0.56,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 3,
      })
    );
    pylonGeo.rotateX(-Math.PI / 2);

    const darkSlateMetal = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x213145,
        metalness: 0.78,
        roughness: 0.34,
      })
    );
    const capGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 24));

    const pylonRefs: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const pNode = new THREE.Group();
      const ang = (i * Math.PI) / 2 + Math.PI / 4;
      pNode.userData.baseAngle = ang;
      pNode.position.set(Math.cos(ang) * 1.62, 0, Math.sin(ang) * 1.62);
      pNode.rotation.y = -ang + Math.PI / 2;

      const body = new THREE.Mesh(pylonGeo, darkSlateMetal);
      body.castShadow = true;
      body.receiveShadow = true;
      pNode.add(body);

      const beacon = new THREE.Mesh(capGeo, tealMetalMat);
      beacon.position.y = 0.59;
      pNode.add(beacon);

      pylonsGroup.add(pNode);
      pylonRefs.push(pNode);
    }

    // Part 8: Gimbaled Consensus Rings (TorusGeometry)
    const consensusGroup = new THREE.Group();
    consensusGroup.position.set(0, 1.48, 0);
    rootRig.add(consensusGroup);

    const outerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.98, 0.02, 20, 96)),
      chassisMat
    );
    outerRing.rotation.set(0.38, 0.2, 0.1);
    outerRing.castShadow = true;
    consensusGroup.add(outerRing);

    const innerTealRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.74, 0.015, 18, 84)),
      tealMetalMat
    );
    innerTealRing.rotation.set(Math.PI / 2 - 0.32, 0.15, 0);
    consensusGroup.add(innerTealRing);

    // Part 9: 5-Agent Medical Review Board Satellites (Alpha..Epsilon)
    const agentsGroup = new THREE.Group();
    agentsGroup.position.set(0, 1.48, 0);
    rootRig.add(agentsGroup);

    const agentCoreGeo = trackGeo(new THREE.OctahedronGeometry(0.085, 1));
    const agentCollarGeo = trackGeo(new THREE.TorusGeometry(0.12, 0.012, 12, 36));
    const agentSatellites: THREE.Group[] = [];
    for (let i = 0; i < 5; i++) {
      const sat = new THREE.Group();
      const core = new THREE.Mesh(agentCoreGeo, tealMetalMat);
      const collar = new THREE.Mesh(agentCollarGeo, chassisMat);
      collar.rotation.x = Math.PI / 2;
      sat.add(core);
      sat.add(collar);
      agentsGroup.add(sat);
      agentSatellites.push(sat);
    }

    // Part 10: Swirling Vortex RAG Telemetry Capsules — InstancedMesh (36 > 20 repeated items)
    const packetCount = 36;
    const packetProfile = [
      new THREE.Vector2(0.0, -0.055),
      new THREE.Vector2(0.026, -0.04),
      new THREE.Vector2(0.028, 0.04),
      new THREE.Vector2(0.0, 0.055),
    ];
    const packetGeo = trackGeo(new THREE.LatheGeometry(packetProfile, 16));
    const packetMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.12,
        metalness: 0.55,
        clearcoat: 0.9,
      })
    );
    const packetInstanced = new THREE.InstancedMesh(packetGeo, packetMat, packetCount);
    packetInstanced.frustumCulled = false;

    const packetSeeds = Array.from({ length: packetCount }, (_, i) => {
      const t = i / packetCount;
      return {
        angleOffset: t * Math.PI * 4.0,
        radius: 0.34 + t * 0.95,
        yBase: 0.78 + Math.sin(t * Math.PI * 1.5) * 0.85 + t * 0.35,
        scale: 0.85 + ((i * 17) % 31) * 0.01,
        phase: i * 0.61,
      };
    });

    const colTeal = new THREE.Color(0x0d9488);
    const colCyan = new THREE.Color(0x38bdf8);
    const colSilver = new THREE.Color(0xe2e8f0);
    const colTmp = new THREE.Color();
    for (let i = 0; i < packetCount; i++) {
      if (i % 4 === 0) colTmp.copy(colSilver);
      else colTmp.copy(colTeal).lerp(colCyan, (i % 5) * 0.22);
      packetInstanced.setColorAt(i, colTmp);
    }
    if (packetInstanced.instanceColor) packetInstanced.instanceColor.needsUpdate = true;
    rootRig.add(packetInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const applyThemePalette = (tMode: ThemeMode) => {
      const bgHex = tMode === 'dark' ? 0x070d17 : 0xf1f5fd;
      const floorHex = tMode === 'dark' ? 0x0a1322 : 0xe5eefc;
      const plinthHex = tMode === 'dark' ? 0x132036 : 0x213145;
      (scene.background as THREE.Color).setHex(bgHex);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(bgHex);
      }
      floorMat.color.setHex(floorHex);
      plinthMat.color.setHex(plinthHex);
      hemiLight.intensity = tMode === 'dark' ? 0.72 : 0.96;
      contactMat.opacity = tMode === 'dark' ? 0.65 : 0.42;
    };

    applyThemePalette(stateRef.current.theme);

    const unregisterThemeHook = registerThemeCanvasRenderer((targetTheme) => {
      applyThemePalette(targetTheme);
      renderer.render(scene, camera);
    });

    let curExploded = 0;
    let lastNow = performance.now();
    let elapsed = 0;
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext | null;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) * 0.001));
      lastNow = now;

      const rateMult =
        stateRef.current.streamRate === 'idle'
          ? 0.38
          : stateRef.current.streamRate === 'burst'
            ? 2.1
            : 1.0;
      elapsed += dt * rateMult;

      applyThemePalette(stateRef.current.theme);

      if (stateRef.current.finish === 'titanium') {
        chassisMat.color.setHex(0xdbe4f0);
        chassisMat.metalness = 0.88;
        chassisMat.roughness = 0.22;
      } else if (stateRef.current.finish === 'ceramic') {
        chassisMat.color.setHex(0xf8fafc);
        chassisMat.metalness = 0.12;
        chassisMat.roughness = 0.16;
      } else {
        chassisMat.color.setHex(0x162235);
        chassisMat.metalness = 0.82;
        chassisMat.roughness = 0.28;
      }

      curExploded = THREE.MathUtils.damp(curExploded, stateRef.current.exploded, 4.5, dt);

      chassisGroup.position.y = 0.22 + curExploded * 0.18;
      transducerGroup.position.y = 0.56 + curExploded * 0.42;
      domeGroup.position.y = 0.58 + curExploded * 0.88;
      consensusGroup.position.y = 1.48 + curExploded * 1.05;
      agentsGroup.position.y = 1.48 + curExploded * 1.05;

      pylonRefs.forEach((pNode) => {
        const ang = pNode.userData.baseAngle as number;
        const rad = 1.62 + curExploded * 0.55;
        pNode.position.set(Math.cos(ang) * rad, curExploded * 0.24, Math.sin(ang) * rad);
      });

      outerRing.rotation.y = elapsed * 0.36;
      outerRing.rotation.x = 0.38 + Math.sin(elapsed * 0.55) * 0.09;
      innerTealRing.rotation.z = -elapsed * 0.52;
      dialPlane.rotation.z = elapsed * 0.05;

      agentSatellites.forEach((sat, idx) => {
        const a = (idx / 5) * Math.PI * 2 + elapsed * 0.48;
        const r = 1.18 + curExploded * 0.34;
        sat.position.set(Math.cos(a) * r, Math.sin(elapsed * 1.4 + idx) * 0.12, Math.sin(a) * r);
        sat.rotation.y = -a;
      });

      if (transducerMat.userData.shader) {
        transducerMat.userData.shader.uniforms.uAcousticTime.value = elapsed;
      }

      for (let i = 0; i < packetCount; i++) {
        const s = packetSeeds[i];
        const theta = s.angleOffset + elapsed * (0.95 / (0.42 + s.radius));
        const rad = s.radius * (1.0 + curExploded * 0.4);
        const y = s.yBase + curExploded * 0.72 + Math.sin(elapsed * 1.8 + s.phase) * 0.06;

        _pos.set(Math.cos(theta) * rad, y, Math.sin(theta) * rad);
        _euler.set(0.3 * Math.sin(theta), -theta, 0.25 * Math.cos(theta));
        _quat.setFromEuler(_euler);
        _scale.setScalar(s.scale);
        _mat4.compose(_pos, _quat, _scale);
        packetInstanced.setMatrixAt(i, _mat4);
      }
      packetInstanced.instanceMatrix.needsUpdate = true;

      if (stateRef.current.animateCamera) {
        const preset = CAMERA_PRESETS[stateRef.current.cameraPreset];
        _camGoal.set(...preset.pos);
        _targetGoal.set(...preset.target);
        const alpha = 1 - Math.exp(-3.5 * dt);
        camera.position.lerp(_camGoal, alpha);
        controls.target.lerp(_targetGoal, alpha);
        if (
          camera.position.distanceToSquared(_camGoal) < 0.0008 &&
          controls.target.distanceToSquared(_targetGoal) < 0.0008
        ) {
          camera.position.copy(_camGoal);
          controls.target.copy(_targetGoal);
          stateRef.current.animateCamera = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(260, Math.floor(entry.contentRect.width));
      const h = Math.max(260, Math.floor(entry.contentRect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      disposed = true;
      unregisterThemeHook();
      ro.disconnect();
      controls.removeEventListener('start', onCtrlStart);
      controls.dispose();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[68vh] min-h-[540px] max-h-[800px] rounded-xl overflow-hidden border border-border-subtle shadow-lg bg-surface-container-lowest">
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Minimal Spec Header (Solid/RGBA surface, zero backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-lg border border-slate-700/60 bg-slate-900/92 px-3.5 py-2 text-slate-100">
        <div className="font-code-badge tracking-wider text-teal-400">
          AIMS Clinical Intelligence • Scribe • OCR • Coding • Office Ally
        </div>
        <div className="font-caption text-slate-300">
          Interactive scribe illustration · Drag to rotate
        </div>
      </div>

      {/* Collapsible Unified Bottom Control Dock (<= 15% viewport, solid RGBA surface, zero backdrop-filter) */}
      <div
        className="absolute bottom-4 left-1/2 z-10 w-[94%] max-w-[920px] transition-transform duration-200"
        style={{
          transform: dockCollapsed ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)',
        }}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-slate-700 bg-slate-900 px-3.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {dockCollapsed ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
            <span>{dockCollapsed ? 'Show 3D Controls (H)' : 'Hide 3D Controls (H)'}</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/96 px-4 py-3 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Exploded Assembly Slider */}
            <div className="flex items-center gap-2.5">
              <label htmlFor="node-explode-slider" className="font-caption text-slate-300 whitespace-nowrap">
                Explode Rig
              </label>
              <input
                id="node-explode-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={exploded}
                onChange={(e) => setExploded(parseFloat(e.target.value))}
                className="w-24 accent-teal-500 cursor-pointer"
              />
              <span className="font-code-clinical text-xs text-teal-400 w-9 text-right">
                {Math.round(exploded * 100)}%
              </span>
            </div>

            {/* Camera View Presets */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
              {(Object.keys(CAMERA_PRESETS) as NodeCameraPreset[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectPreset(key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraPreset === key
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {CAMERA_PRESETS[key].label}
                </button>
              ))}
            </div>

            {/* Chassis Finish */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
              {(
                [
                  { id: 'titanium', label: 'Titanium' },
                  { id: 'ceramic', label: 'Ceramic' },
                  { id: 'obsidian', label: 'Obsidian' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    finish === f.id ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stream Velocity + Direct Vortex Ink Bleed Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setStreamRate((r) => (r === 'idle' ? 'active' : r === 'active' ? 'burst' : 'idle'))
                }
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap cursor-pointer"
              >
                AI Stream: {streamRate.toUpperCase()}
              </button>

              <button
                type="button"
                data-ink-toggle="true"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">contrast</span>
                <span>Switch Theme</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
