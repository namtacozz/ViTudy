/**
 * 3D Rigid-Body Physics Dice Engine
 * Ported & modernized to TypeScript (Three.js + cannon-es) from:
 * https://github.com/sarahRosannaBusch/dice (MIT License)
 */
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getAssetPath } from '@/lib/assets';

const FRAME_RATE = 1 / 60;

// Three.js BoxGeometry material index order: +X, -X, +Y, -Y, +Z, -Z
const D6_FACE_VALUES = [3, 4, 2, 5, 1, 6] as const;
const D6_LOCAL_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.27, 0.27],
    [0.73, 0.73],
  ],
  3: [
    [0.25, 0.25],
    [0.5, 0.5],
    [0.75, 0.75],
  ],
  4: [
    [0.27, 0.27],
    [0.73, 0.27],
    [0.27, 0.73],
    [0.73, 0.73],
  ],
  5: [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.5, 0.5],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
  6: [
    [0.27, 0.23],
    [0.73, 0.23],
    [0.27, 0.5],
    [0.73, 0.5],
    [0.27, 0.77],
    [0.73, 0.77],
  ],
};

export interface DropZoneRect {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface DieSpec {
  sides: number;
  diceColor?: string;
  labelColor?: string;
}

function createD6FaceTexture(
  value: number,
  diceColor = '#ffffff',
  labelColor = '#0f172a'
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = diceColor;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.14)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, size - 10, size - 10);

  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  const radius = value === 1 ? 28 : 21;
  // Use Cam ViT accent on pip 1 when die body is light white
  const isDefaultWhite = diceColor.toLowerCase() === '#ffffff' || diceColor.toLowerCase() === '#fff';
  ctx.fillStyle = value === 1 && isDefaultWhite ? '#E0562D' : labelColor;

  for (const [nx, ny] of pips) {
    ctx.beginPath();
    ctx.arc(nx * size, ny * size, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createNumberFaceTexture(
  text: string,
  diceColor = '#ffffff',
  labelColor = '#0f172a'
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = diceColor;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, size - 10, size - 10);

  ctx.fillStyle = labelColor;
  ctx.font = `900 ${text.length >= 3 ? 82 : 108}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

interface DieInstance {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  sides: number;
  faceNormals: THREE.Vector3[];
  faceValues: number[];
  disposables: Array<{ dispose: () => void }>;
  stoppedAtIteration?: number;
  settled: boolean;
}

export class PhysicsDiceBox {
  private container: HTMLElement;
  private dropZone: DropZoneRect | null = null;
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private world: CANNON.World;
  private diceBodyMaterial: CANNON.Material;
  private light!: THREE.SpotLight;
  private floorMesh!: THREE.Mesh;
  private barrierBodies: CANNON.Body[] = [];

  private dice: DieInstance[] = [];
  private cw = 100;
  private ch = 100;
  private scale = 25;
  private rolling = false;
  private rafId: number | null = null;
  private lastTime = 0;
  private iteration = 0;
  private disposed = false;

  constructor(container: HTMLElement, dropZone?: DropZoneRect) {
    this.container = container;
    this.dropZone = dropZone || null;
    this.scene = new THREE.Scene();
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -9.8 * 800);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    (this.world.solver as CANNON.GSSolver).iterations = 16;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    this.diceBodyMaterial = new CANNON.Material('dice');
    const deskMaterial = new CANNON.Material('desk');
    const barrierMaterial = new CANNON.Material('barrier');

    this.world.addContactMaterial(
      new CANNON.ContactMaterial(deskMaterial, this.diceBodyMaterial, {
        friction: 0.02,
        restitution: 0.5,
      })
    );
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(barrierMaterial, this.diceBodyMaterial, {
        friction: 0,
        restitution: 0.9,
      })
    );
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.diceBodyMaterial, this.diceBodyMaterial, {
        friction: 0.01,
        restitution: 0.55,
      })
    );

    const floorBody = new CANNON.Body({ mass: 0, material: deskMaterial });
    floorBody.addShape(new CANNON.Plane());
    this.world.addBody(floorBody);

    this.resize();
  }

  public setDropZone(dropZone: DropZoneRect) {
    this.dropZone = dropZone;
    this.resize();
  }

  private getZoneWorldCenter(): { x: number; y: number; halfW: number; halfH: number } {
    if (!this.dropZone) {
      return { x: 0, y: 0, halfW: this.cw * 0.85, halfH: this.ch * 0.85 };
    }
    return {
      x: this.dropZone.centerX - this.cw,
      y: this.ch - this.dropZone.centerY,
      halfW: Math.max(36, this.dropZone.width * 0.43),
      halfH: Math.max(36, this.dropZone.height * 0.43),
    };
  }

  public resize() {
    if (this.disposed) return;
    const width = Math.max(80, this.container.clientWidth || 140);
    const height = Math.max(80, this.container.clientHeight || 140);
    this.cw = width / 2;
    this.ch = height / 2;
    const zoneDim = this.dropZone
      ? Math.min(this.dropZone.width, this.dropZone.height)
      : Math.min(width, height);
    this.scale = Math.max(18, Math.min(44, zoneDim * 0.21));

    this.renderer.setSize(width, height, false);

    const wh = this.ch / Math.tan((11 * Math.PI) / 180);
    this.camera = new THREE.PerspectiveCamera(22, this.cw / this.ch, 1, wh * 2.5);
    this.camera.position.set(0, 0, wh);
    this.camera.lookAt(0, 0, 0);

    const mw = Math.max(this.cw, this.ch);
    const zone = this.getZoneWorldCenter();
    if (this.light) this.scene.remove(this.light);
    this.light = new THREE.SpotLight(0xffffff, 2.4);
    this.light.position.set(zone.x - mw * 0.35, zone.y + mw * 0.35, mw * 2.2);
    this.light.target.position.set(zone.x, zone.y, 0);
    this.light.distance = mw * 6;
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 512;
    this.light.shadow.mapSize.height = 512;
    this.light.shadow.camera.near = mw / 10;
    this.light.shadow.camera.far = mw * 5;
    this.scene.add(this.light);
    this.scene.add(this.light.target);

    if (this.floorMesh) {
      this.scene.remove(this.floorMesh);
      this.floorMesh.geometry.dispose();
    }
    this.floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 2, height * 2),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    for (const b of this.barrierBodies) {
      this.world.removeBody(b);
    }
    this.barrierBodies = [];
    const barrierMat = new CANNON.Material('barrier');
    const walls: Array<{ pos: [number, number, number]; axis: [number, number, number]; angle: number }> = [
      { pos: [zone.x, zone.y + zone.halfH, 0], axis: [1, 0, 0], angle: Math.PI / 2 },
      { pos: [zone.x, zone.y - zone.halfH, 0], axis: [1, 0, 0], angle: -Math.PI / 2 },
      { pos: [zone.x + zone.halfW, zone.y, 0], axis: [0, 1, 0], angle: -Math.PI / 2 },
      { pos: [zone.x - zone.halfW, zone.y, 0], axis: [0, 1, 0], angle: Math.PI / 2 },
    ];
    for (const w of walls) {
      const body = new CANNON.Body({ mass: 0, material: barrierMat });
      body.addShape(new CANNON.Plane());
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(...w.axis), w.angle);
      body.position.set(...w.pos);
      this.world.addBody(body);
      this.barrierBodies.push(body);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private buildDie(spec: DieSpec): DieInstance {
    const sides = Math.max(2, Math.min(100, Math.round(spec.sides || 6)));
    const diceColor = spec.diceColor || '#ffffff';
    const labelColor = spec.labelColor || '#0f172a';
    const disposables: Array<{ dispose: () => void }> = [];

    const halfSize = this.scale * 0.55;
    const radius = halfSize * 1.15;

    if (sides === 6) {
      const boxSize = halfSize * 2;
      const geom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
      disposables.push(geom);
      const mats = D6_FACE_VALUES.map((val) => {
        const tex = createD6FaceTexture(val, diceColor, labelColor);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.05 });
        disposables.push(tex, mat);
        return mat;
      });
      const mesh = new THREE.Mesh(geom, mats);
      mesh.castShadow = true;
      const body = new CANNON.Body({
        mass: 300,
        material: this.diceBodyMaterial,
        linearDamping: 0.14,
        angularDamping: 0.14,
      });
      body.addShape(new CANNON.Box(new CANNON.Vec3(halfSize, halfSize, halfSize)));
      return {
        mesh,
        body,
        sides: 6,
        faceNormals: D6_LOCAL_NORMALS.map((n) => n.clone()),
        faceValues: [...D6_FACE_VALUES],
        disposables,
        settled: false,
      };
    }

    // Polyhedral / custom N-sided die
    let geom: THREE.BufferGeometry;
    if (sides === 2) {
      geom = new THREE.CylinderGeometry(radius, radius, radius * 0.35, 24);
    } else if (sides === 4) {
      geom = new THREE.TetrahedronGeometry(radius * 1.25, 0);
    } else if (sides === 8) {
      geom = new THREE.OctahedronGeometry(radius * 1.1, 0);
    } else if (sides === 12) {
      geom = new THREE.DodecahedronGeometry(radius * 1.05, 0);
    } else {
      // d10, d20, d100, or custom N-sided: crisp icosahedron polyhedron
      geom = new THREE.IcosahedronGeometry(radius * 1.05, 0);
    }
    disposables.push(geom);

    // Group triangles by unique face normal so each geometric face gets a numbered material
    const posAttr = geom.getAttribute('position');
    const faceNormals: THREE.Vector3[] = [];
    const faceValues: number[] = [];
    const triCount = Math.floor(posAttr.count / 3);

    geom.clearGroups();
    const normalToGroup = new Map<string, number>();
    let groupIdx = 0;

    for (let t = 0; t < triCount; t++) {
      const i0 = t * 3;
      const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
      const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i0 + 1);
      const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i0 + 2);
      const n = new THREE.Vector3().subVectors(v1, v0).cross(new THREE.Vector3().subVectors(v2, v0)).normalize();
      const key = `${Math.round(n.x * 50)}_${Math.round(n.y * 50)}_${Math.round(n.z * 50)}`;

      let g = normalToGroup.get(key);
      if (g === undefined) {
        g = groupIdx++;
        normalToGroup.set(key, g);
        faceNormals.push(n);
        faceValues.push(((g % sides) + 1));
      }
      geom.addGroup(i0, 3, g);
    }

    // Generate UV coordinates per triangle so face numbers appear centered on each face
    const uvs = new Float32Array(posAttr.count * 2);
    for (let t = 0; t < triCount; t++) {
      const base = t * 6;
      uvs[base] = 0.5;
      uvs[base + 1] = 0.88;
      uvs[base + 2] = 0.14;
      uvs[base + 3] = 0.2;
      uvs[base + 4] = 0.86;
      uvs[base + 5] = 0.2;
    }
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const mats = faceValues.map((val) => {
      const tex = createNumberFaceTexture(String(val), diceColor, labelColor);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.08 });
      disposables.push(tex, mat);
      return mat;
    });

    const mesh = new THREE.Mesh(geom, mats);
    mesh.castShadow = true;

    const body = new CANNON.Body({
      mass: 320,
      material: this.diceBodyMaterial,
      linearDamping: 0.15,
      angularDamping: 0.15,
    });
    if (sides === 2) {
      body.addShape(new CANNON.Cylinder(radius, radius, radius * 0.35, 16));
    } else {
      body.addShape(new CANNON.Box(new CANNON.Vec3(halfSize, halfSize, halfSize)));
    }

    return {
      mesh,
      body,
      sides,
      faceNormals,
      faceValues,
      disposables,
      settled: false,
    };
  }

  public showStaticValues(values: number[], specs?: DieSpec[]) {
    if (this.disposed || this.rolling) return;
    this.clearDice();
    const count = Math.max(1, specs ? specs.length : values.length);
    const halfSize = this.scale * 0.55;
    const spacing = halfSize * 2.7;
    const zone = this.getZoneWorldCenter();
    const startX = zone.x - ((count - 1) * spacing) / 2;

    for (let idx = 0; idx < count; idx++) {
      const spec = specs?.[idx] || { sides: 6 };
      const val = values[idx] ?? 1;
      const inst = this.buildDie(spec);
      inst.body.position.set(startX + idx * spacing, zone.y, halfSize);

      if (inst.sides === 6) {
        const q = quaternionForD6TopValue(val);
        inst.body.quaternion.copy(q);
      } else {
        // Orient the closest matching face normal toward +Z
        const faceIdx = Math.max(0, inst.faceValues.indexOf(val));
        const normal = inst.faceNormals[faceIdx] || new THREE.Vector3(0, 0, 1);
        const qThree = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
        inst.body.quaternion.set(qThree.x, qThree.y, qThree.z, qThree.w);
      }

      inst.mesh.position.set(inst.body.position.x, inst.body.position.y, inst.body.position.z);
      inst.mesh.quaternion.set(
        inst.body.quaternion.x,
        inst.body.quaternion.y,
        inst.body.quaternion.z,
        inst.body.quaternion.w
      );
      inst.settled = true;

      this.scene.add(inst.mesh);
      this.world.addBody(inst.body);
      this.dice.push(inst);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public startThrow(
    specsOrCount: number | DieSpec[],
    onComplete: (values: number[]) => void,
    swipeVector?: { x: number; y: number }
  ) {
    if (this.disposed || this.rolling) return;
    this.rolling = true;
    this.clearDice();

    const specs: DieSpec[] = Array.isArray(specsOrCount)
      ? specsOrCount
      : Array.from({ length: specsOrCount }, () => ({ sides: 6 }));

    this.playRollSound(specs.length);

    const zone = this.getZoneWorldCenter();
    const rawVec =
      swipeVector && (Math.abs(swipeVector.x) > 4 || Math.abs(swipeVector.y) > 4)
        ? { x: swipeVector.x, y: -swipeVector.y }
        : { x: (Math.random() * 2 - 1) * this.cw, y: -(Math.random() * 2 - 1) * this.ch };

    const dist = Math.max(1, Math.hypot(rawVec.x, rawVec.y));
    const norm = { x: rawVec.x / dist, y: rawVec.y / dist };
    const boost = (Math.random() + 2.4) * Math.max(this.cw, this.ch) * 0.9;
    const halfSize = this.scale * 0.55;

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const vec = makeRandomVector(norm);
      const spreadX = Math.min(this.cw * 0.72, zone.halfW * 2.8);
      const spreadY = Math.min(this.ch * 0.72, zone.halfH * 2.8);
      const posX =
        zone.x + (vec.x > 0 ? -1 : 1) * spreadX + (i - (specs.length - 1) / 2) * (halfSize * 1.4);
      const posY = zone.y + (vec.y > 0 ? -1 : 1) * spreadY;
      const posZ = Math.random() * 140 + 260;

      const velVec = makeRandomVector(norm);
      const toZoneX = zone.x - posX;
      const toZoneY = zone.y - posY;

      const inst = this.buildDie(spec);
      inst.body.position.set(posX, posY, posZ);
      inst.body.velocity.set(
        toZoneX * 2.6 + velVec.x * boost * 0.25,
        toZoneY * 2.6 + velVec.y * boost * 0.25,
        -220
      );
      inst.body.angularVelocity.set(
        -(Math.random() * vec.y * 8 + 14 * vec.y),
        Math.random() * vec.x * 8 + 14 * vec.x,
        (Math.random() - 0.5) * 10
      );
      inst.body.quaternion.setFromAxisAngle(
        new CANNON.Vec3(Math.random() || 1, Math.random(), Math.random()).unit(),
        Math.random() * Math.PI * 2
      );

      this.scene.add(inst.mesh);
      this.world.addBody(inst.body);
      this.dice.push(inst);
    }

    this.iteration = 0;
    this.lastTime = performance.now();

    const stepLoop = (now: number) => {
      if (this.disposed) return;
      let dt = (now - this.lastTime) / 1000;
      if (dt > 0.1) dt = FRAME_RATE;
      this.lastTime = now;

      let steps = 0;
      while (dt > FRAME_RATE * 0.5 && steps < 4) {
        this.world.step(FRAME_RATE);
        dt -= FRAME_RATE;
        steps++;
        this.iteration++;
      }
      if (steps === 0) {
        this.world.step(FRAME_RATE);
        this.iteration++;
      }

      for (const d of this.dice) {
        d.mesh.position.set(d.body.position.x, d.body.position.y, d.body.position.z);
        d.mesh.quaternion.set(
          d.body.quaternion.x,
          d.body.quaternion.y,
          d.body.quaternion.z,
          d.body.quaternion.w
        );
      }
      this.renderer.render(this.scene, this.camera);

      if (this.checkThrowFinished()) {
        this.rolling = false;
        this.rafId = null;
        const results = this.dice.map((d) => {
          // For sides > geometric face count (e.g. d100 on 20-face polyhedron), sample uniformly 1..sides
          if (d.sides > d.faceNormals.length) {
            return Math.floor(Math.random() * d.sides) + 1;
          }
          return getDieTopValue(d.body, d.faceNormals, d.faceValues);
        });
        onComplete(results);
        return;
      }

      this.rafId = requestAnimationFrame(stepLoop);
    };

    this.rafId = requestAnimationFrame(stepLoop);
  }

  private checkThrowFinished(): boolean {
    if (this.iteration > 240) return true;
    const threshold = 7;
    let allSettled = true;
    for (const d of this.dice) {
      if (d.settled) continue;
      const a = d.body.angularVelocity;
      const v = d.body.velocity;
      if (
        Math.abs(a.x) < threshold &&
        Math.abs(a.y) < threshold &&
        Math.abs(a.z) < threshold &&
        Math.abs(v.x) < threshold &&
        Math.abs(v.y) < threshold &&
        Math.abs(v.z) < threshold
      ) {
        if (d.stoppedAtIteration === undefined) {
          d.stoppedAtIteration = this.iteration;
          allSettled = false;
        } else if (this.iteration - d.stoppedAtIteration > 4) {
          d.settled = true;
        } else {
          allSettled = false;
        }
      } else {
        d.stoppedAtIteration = undefined;
        allSettled = false;
      }
    }
    return allSettled;
  }

  private playRollSound(diceCount: number) {
    try {
      const audio = new Audio(getAssetPath('/sounds/dice-roll.mp3'));
      audio.volume = Math.min(0.7, 0.25 + diceCount * 0.12);
      audio.play().catch(() => {});
    } catch {}
  }

  private clearDice() {
    for (const d of this.dice) {
      this.scene.remove(d.mesh);
      this.world.removeBody(d.body);
      for (const item of d.disposables) item.dispose();
    }
    this.dice = [];
  }

  public dispose() {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.clearDice();
    this.floorMesh?.geometry.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

function makeRandomVector(vector: { x: number; y: number }): { x: number; y: number } {
  const randomAngle = (Math.random() * Math.PI) / 5 - Math.PI / 10;
  return {
    x: vector.x * Math.cos(randomAngle) - vector.y * Math.sin(randomAngle),
    y: vector.x * Math.sin(randomAngle) + vector.y * Math.cos(randomAngle),
  };
}

function getDieTopValue(
  body: CANNON.Body,
  faceNormals: THREE.Vector3[],
  faceValues: number[]
): number {
  const q = new THREE.Quaternion(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  );
  let bestDot = -Infinity;
  let bestValue = 1;
  const rotated = new THREE.Vector3();
  for (let i = 0; i < faceNormals.length; i++) {
    rotated.copy(faceNormals[i]).applyQuaternion(q);
    if (rotated.z > bestDot) {
      bestDot = rotated.z;
      bestValue = faceValues[i] ?? 1;
    }
  }
  return bestValue;
}

function quaternionForD6TopValue(value: number): CANNON.Quaternion {
  const q = new CANNON.Quaternion();
  switch (value) {
    case 1:
      q.set(0, 0, 0, 1);
      break;
    case 6:
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
      break;
    case 3:
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
      break;
    case 4:
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      break;
    case 2:
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      break;
    case 5:
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      break;
    default:
      q.set(0, 0, 0, 1);
  }
  return q;
}
