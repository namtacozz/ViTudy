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
// Standard die opposite faces sum to 7: (3,4), (2,5), (1,6)
const FACE_VALUES = [3, 4, 2, 5, 1, 6] as const;
const LOCAL_NORMALS = [
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

function createD6FaceTexture(value: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Ivory-white die face with subtle bevel border
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, size - 10, size - 10);

  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  const radius = value === 1 ? 28 : 21;
  ctx.fillStyle = value === 1 ? '#E0562D' : '#0f172a';

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

export interface DropZoneRect {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

interface DieInstance {
  mesh: THREE.Mesh;
  body: CANNON.Body;
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
  private sharedMaterials: THREE.MeshStandardMaterial[] = [];
  private sharedTextures: THREE.CanvasTexture[] = [];
  private sharedGeometry: THREE.BoxGeometry | null = null;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
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

    // Floor rigid body at z = 0
    const floorBody = new CANNON.Body({ mass: 0, material: deskMaterial });
    floorBody.addShape(new CANNON.Plane());
    this.world.addBody(floorBody);

    this.sharedMaterials = FACE_VALUES.map((val) => {
      const tex = createD6FaceTexture(val);
      this.sharedTextures.push(tex);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.35,
        metalness: 0.05,
      });
    });

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
    const zoneDim = this.dropZone ? Math.min(this.dropZone.width, this.dropZone.height) : Math.min(width, height);
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

    // Rebuild 4 arena wall barriers around the dropZone (so dice land inside it!)
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

  public showStaticValues(values: number[]) {
    if (this.disposed || this.rolling) return;
    this.clearDice();
    const count = Math.max(1, values.length);
    const halfSize = this.scale * 0.55;
    const boxSize = halfSize * 2;
    if (!this.sharedGeometry) {
      this.sharedGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    }

    const spacing = boxSize * 1.35;
    const zone = this.getZoneWorldCenter();
    const startX = zone.x - ((count - 1) * spacing) / 2;

    values.forEach((val, idx) => {
      const mesh = new THREE.Mesh(this.sharedGeometry!, this.sharedMaterials);
      mesh.castShadow = true;
      const body = new CANNON.Body({ mass: 300, material: this.diceBodyMaterial });
      body.addShape(new CANNON.Box(new CANNON.Vec3(halfSize, halfSize, halfSize)));
      body.position.set(startX + idx * spacing, zone.y, halfSize);

      // Orient top (+Z) to match `val`
      const q = quaternionForTopValue(val);
      body.quaternion.copy(q);
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.quaternion.set(q.x, q.y, q.z, q.w);

      this.scene.add(mesh);
      this.world.addBody(body);
      this.dice.push({ mesh, body, settled: true });
    });

    this.renderer.render(this.scene, this.camera);
  }

  public startThrow(
    diceCount: number,
    onComplete: (values: number[]) => void,
    swipeVector?: { x: number; y: number }
  ) {
    if (this.disposed || this.rolling) return;
    this.rolling = true;
    this.clearDice();
    this.playRollSound(diceCount);

    const zone = this.getZoneWorldCenter();
    const rawVec = swipeVector && (Math.abs(swipeVector.x) > 4 || Math.abs(swipeVector.y) > 4)
      ? { x: swipeVector.x, y: -swipeVector.y }
      : { x: (Math.random() * 2 - 1) * this.cw, y: -(Math.random() * 2 - 1) * this.ch };

    const dist = Math.max(1, Math.hypot(rawVec.x, rawVec.y));
    const norm = { x: rawVec.x / dist, y: rawVec.y / dist };
    const boost = (Math.random() + 2.4) * Math.max(this.cw, this.ch) * 0.9;

    const halfSize = this.scale * 0.55;
    const boxSize = halfSize * 2;
    this.sharedGeometry?.dispose();
    this.sharedGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

    for (let i = 0; i < diceCount; i++) {
      const vec = makeRandomVector(norm);
      // Spawn high above and spread across the whole map, flying toward the dropZone
      const spreadX = Math.min(this.cw * 0.72, zone.halfW * 2.8);
      const spreadY = Math.min(this.ch * 0.72, zone.halfH * 2.8);
      const posX = zone.x + (vec.x > 0 ? -1 : 1) * spreadX + (i - (diceCount - 1) / 2) * (boxSize * 0.7);
      const posY = zone.y + (vec.y > 0 ? -1 : 1) * spreadY;
      const posZ = Math.random() * 140 + 260;

      const velVec = makeRandomVector(norm);
      const toZoneX = zone.x - posX;
      const toZoneY = zone.y - posY;
      const mesh = new THREE.Mesh(this.sharedGeometry, this.sharedMaterials);
      mesh.castShadow = true;

      const body = new CANNON.Body({
        mass: 300,
        material: this.diceBodyMaterial,
        linearDamping: 0.14,
        angularDamping: 0.14,
      });
      body.addShape(new CANNON.Box(new CANNON.Vec3(halfSize, halfSize, halfSize)));
      body.position.set(posX, posY, posZ);
      body.velocity.set(
        toZoneX * 2.6 + velVec.x * boost * 0.25,
        toZoneY * 2.6 + velVec.y * boost * 0.25,
        -220
      );
      body.angularVelocity.set(
        -(Math.random() * vec.y * 8 + 14 * vec.y),
        Math.random() * vec.x * 8 + 14 * vec.x,
        (Math.random() - 0.5) * 10
      );
      body.quaternion.setFromAxisAngle(
        new CANNON.Vec3(Math.random() || 1, Math.random(), Math.random()).unit(),
        Math.random() * Math.PI * 2
      );

      this.scene.add(mesh);
      this.world.addBody(body);
      this.dice.push({ mesh, body, settled: false });
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
        const results = this.dice.map((d) => getDieTopValue(d.body));
        onComplete(results);
        return;
      }

      this.rafId = requestAnimationFrame(stepLoop);
    };

    this.rafId = requestAnimationFrame(stepLoop);
  }

  private checkThrowFinished(): boolean {
    if (this.iteration > 240) return true; // Safety cap (~4s)
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
    }
    this.dice = [];
  }

  public dispose() {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.clearDice();
    this.sharedGeometry?.dispose();
    this.floorMesh?.geometry.dispose();
    for (const m of this.sharedMaterials) m.dispose();
    for (const t of this.sharedTextures) t.dispose();
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

function getDieTopValue(body: CANNON.Body): number {
  const q = new THREE.Quaternion(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  );
  let bestDot = -Infinity;
  let bestValue = 1;
  const rotated = new THREE.Vector3();
  for (let i = 0; i < LOCAL_NORMALS.length; i++) {
    rotated.copy(LOCAL_NORMALS[i]).applyQuaternion(q);
    if (rotated.z > bestDot) {
      bestDot = rotated.z;
      bestValue = FACE_VALUES[i];
    }
  }
  return bestValue;
}

function quaternionForTopValue(value: number): CANNON.Quaternion {
  const q = new CANNON.Quaternion();
  switch (value) {
    case 1: // +Z already up
      q.set(0, 0, 0, 1);
      break;
    case 6: // -Z up -> rotate X 180
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
      break;
    case 3: // +X up -> rotate Y -90
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
      break;
    case 4: // -X up -> rotate Y +90
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      break;
    case 2: // +Y up -> rotate X +90
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      break;
    case 5: // -Y up -> rotate X -90
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      break;
    default:
      q.set(0, 0, 0, 1);
  }
  return q;
}
