import { Injectable } from '@angular/core';

// three is imported untyped: the legacy TS 3.9 toolchain cannot consume
// three's modern type declarations; the build runs transpile-only.
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');
const core = require('./graph3d-core');

/**
 * Scene3dService — owns the Three.js scene for the 3D workspace.
 *
 * Separation of concerns: this service holds ONLY scene state derived
 * from the domain documents handed to setDocs(); the domain graph state
 * stays in the ngrx store / backend, layout logic lives in
 * graph3d-core.js, and interaction policy in the component. The
 * renderer is replaceable without touching the map model.
 *
 * Rendering is on-demand: frames are drawn only after camera movement,
 * data changes or interactions — no continuous GPU load while idle.
 */

export interface Viz3dState {
  version: number;
  preset: string;
  positions: { [id: string]: { x: number, y: number, z: number } };
  shapes: { [id: string]: string };
  locked: { [id: string]: boolean };
  camera?: any;
  viewpoints?: any[];
  scenePreset?: string;
}

const NODE_SHAPES = ['sphere', 'rounded-box', 'cube', 'capsule', 'cylinder',
  'cone', 'torus', 'prism', 'octahedron', 'lowpoly', 'panel', 'image-plane'];

@Injectable()
export class Scene3dService {
  public onSelect: (id: number, additive: boolean) => void = () => undefined;
  public onHover: (id: number) => void = () => undefined;
  public onDragEnd: (id: number, pos: { x: number, y: number, z: number }) => void = () => undefined;
  public onDoubleClick: (id: number) => void = () => undefined;
  public onBackgroundClick: () => void = () => undefined;

  public available = false;
  public failureReason = '';
  public largeMode = false;

  private renderer: any;
  private scene: any;
  private camera: any;
  private controls: any;
  private container: HTMLElement;
  private raycaster: any;
  private pointer: any;
  private nodeMeshes: Map<number, any> = new Map();
  private labelSprites: Map<number, any> = new Map();
  private branchGroup: any;
  private crossGroup: any;
  private nodeGroup: any;
  private labelGroup: any;
  private geoCache: { [k: string]: any } = {};
  private matCache: { [k: string]: any } = {};
  private needsRender = false;
  private rafActive = false;
  private disposed = false;
  private selectionIds: Set<number> = new Set();
  private hoverId = 0;
  private dragState: any = null;
  private docsById: Map<number, any> = new Map();
  private hierarchy: any = null;
  private graph: any = null;
  private positions: Map<number, any> = new Map();

  /** initialize the renderer inside a host element; returns false on WebGL failure */
  public init(container: HTMLElement): boolean {
    this.container = container;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!ctx) {
        this.failureReason = 'WebGL is not available in this browser';
        return false;
      }
      this.renderer = new THREE.WebGLRenderer({ canvas, context: ctx, antialias: true, alpha: false });
    } catch (err) {
      this.failureReason = 'WebGL initialization failed: ' + err.message;
      return false;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50000);
    this.camera.position.set(0, 120, 260);

    // restrained scientific lighting: soft hemisphere + one key light
    const hemi = new THREE.HemisphereLight(0xffffff, 0x30343c, 0.9);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(120, 220, 160);
    this.scene.add(key);

    this.nodeGroup = new THREE.Group();
    this.branchGroup = new THREE.Group();
    this.crossGroup = new THREE.Group();
    this.labelGroup = new THREE.Group();
    this.scene.add(this.branchGroup, this.crossGroup, this.nodeGroup, this.labelGroup);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 8000;
    this.controls.addEventListener('change', () => this.requestRender());

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.bindPointerEvents();
    this.resize();
    window.addEventListener('resize', this.resizeHandler);
    this.applyTheme();
    this.available = true;
    this.startLoop();
    return true;
  }

  private resizeHandler = () => this.resize();

  private resize() {
    if (!this.renderer || !this.container) { return; }
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  /** theme-aware scene colors from CSS custom properties */
  public applyTheme() {
    if (!this.scene) { return; }
    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue('--cm-bg').trim() || '#14181f';
    const dark = document.documentElement.getAttribute('data-theme') !== 'light'
      && (document.documentElement.getAttribute('data-theme') === 'dark'
          || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
    this.scene.background = new THREE.Color(dark ? bg : '#f5f6f8');
    this.scene.fog = new THREE.Fog(this.scene.background, 900, 4000);
    this.requestRender();
  }

  // ----------------------------------------------------------------
  // scene construction
  // ----------------------------------------------------------------

  /** rebuild the scene from legacy documents + persisted viz state */
  public setDocs(docs: any[], viz: Viz3dState) {
    if (!this.available) { return; }
    this.clearScene();
    const preset = (viz && viz.preset) || 'cognitive-tree';
    const result = core.computeLayout(docs, preset, viz && viz.positions);
    this.graph = result.graph;
    this.hierarchy = result.hierarchy;
    this.positions = result.positions;
    this.docsById = result.graph.nodes;
    const n = result.graph.nodes.size;
    this.largeMode = n > 800;

    for (const doc of result.graph.nodeList) {
      const p = result.positions.get(doc.id);
      this.addNodeMesh(doc, p, viz);
    }
    this.buildBranches();
    this.updateLabels(true);
    this.requestRender();
  }

  private clearScene() {
    for (const group of [this.nodeGroup, this.branchGroup, this.crossGroup, this.labelGroup]) {
      if (!group) { continue; }
      const children = group.children.slice();
      for (const c of children) {
        group.remove(c);
        if (c.isInstancedMesh && c.dispose) { c.dispose(); } // frees instanceMatrix
        if (c.geometry && !c.userData.shared) { c.geometry.dispose(); }
        if (c.material && !c.userData.sharedMat) {
          if (c.material.map) { c.material.map.dispose(); }
          c.material.dispose();
        }
      }
    }
    this.nodeMeshes.clear();
    this.labelSprites.clear();
  }

  /** geometry factory with shared cache */
  private geometryFor(shape: string): any {
    if (this.geoCache[shape]) { return this.geoCache[shape]; }
    let g;
    switch (shape) {
      case 'cube': g = new THREE.BoxGeometry(6, 6, 6); break;
      case 'rounded-box': g = new THREE.BoxGeometry(8, 5, 3); break;
      case 'capsule': g = new THREE.CapsuleGeometry(2.4, 5, 6, 12); break;
      case 'cylinder': g = new THREE.CylinderGeometry(3, 3, 6, 20); break;
      case 'cone': g = new THREE.ConeGeometry(3.4, 7, 20); break;
      case 'torus': g = new THREE.TorusGeometry(3.4, 1.2, 12, 28); break;
      case 'prism': g = new THREE.CylinderGeometry(3.6, 3.6, 6, 3); break;
      case 'octahedron': g = new THREE.OctahedronGeometry(4); break;
      case 'lowpoly': g = new THREE.IcosahedronGeometry(4, 0); break;
      case 'panel': g = new THREE.BoxGeometry(9, 5.6, 0.6); break;
      case 'image-plane': g = new THREE.PlaneGeometry(9, 6); break;
      case 'sphere':
      default: g = new THREE.SphereGeometry(3.4, 22, 16); break;
    }
    this.geoCache[shape] = g;
    return g;
  }

  /** shape resolution: explicit viz override -> content type -> default */
  public shapeFor(doc: any, viz: Viz3dState): string {
    if (viz && viz.shapes && viz.shapes[doc.id]) { return viz.shapes[doc.id]; }
    const c = this.parseCmo(doc);
    const content = (c.content || []);
    if (content.some((x) => x && x.cat === 'i')) { return 'image-plane'; }
    if (content.some((x) => x && (x.cat === 'LateX' || x.cat === 'svg' || x.cat === 'jsme-svg'))) { return 'panel'; }
    if (content.some((x) => x && x.cat === 'html')) { return 'prism'; }
    if (doc.types && doc.types[0] === 'q') { return 'octahedron'; }
    if (doc.types && doc.types[0] === 'm') { return 'capsule'; }
    if ((this.hierarchy && this.hierarchy.roots.indexOf(doc.id) !== -1)) { return 'sphere'; }
    return 'rounded-box';
  }

  private parseCmo(doc: any): any {
    try {
      return typeof doc.cmobject === 'string' ? JSON.parse(doc.cmobject) : (doc.cmobject || {});
    } catch (err) { return {}; }
  }

  private materialFor(color: string, shape: string): any {
    const key = color + '|' + (shape === 'panel' ? 'p' : 's');
    if (this.matCache[key]) { return this.matCache[key]; }
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.82,
      metalness: 0.06,
    });
    this.matCache[key] = mat;
    return mat;
  }

  private colorFor(doc: any): string {
    const c = this.parseCmo(doc);
    const style = c.style && c.style.object;
    const col = style && (style.color1 || style.color0);
    if (col && /^#[0-9a-fA-F]{3,8}$/.test(col) && col !== '#ffffff') { return col; }
    // depth-tinted neutral default
    const d = (this.hierarchy && this.hierarchy.depth.get(doc.id)) || 0;
    const base = [0x7a, 0x8b, 0xd4];
    const f = Math.max(0.55, 1 - d * 0.08);
    const hex = ((base[0] * f) << 16 | (base[1] * f) << 8 | (base[2] * f)) & 0xffffff;
    return '#' + ('000000' + hex.toString(16)).slice(-6);
  }

  private addNodeMesh(doc: any, p: any, viz: Viz3dState) {
    const shape = this.shapeFor(doc, viz);
    const geo = this.geometryFor(shape);
    const mesh = new THREE.Mesh(geo, this.materialFor(this.colorFor(doc), shape));
    mesh.position.set(p.x, p.y, p.z);
    mesh.userData = { id: doc.id, shape, shared: true, sharedMat: true };
    this.nodeGroup.add(mesh);
    this.nodeMeshes.set(doc.id, mesh);
  }

  private buildBranches() {
    const structural = [];
    const cross = [];
    for (const e of this.graph.edges) {
      const a = this.positions.get(e.source);
      const b = this.positions.get(e.target);
      if (!a || !b) { continue; }
      (e.cross ? cross : structural).push([a, b, e]);
    }
    // structural: tube curves for small maps, instanced thin cylinders
    // otherwise — real geometric diameter comparable to the 2D line
    // thickness (screen-space hairlines at tens of thousands of edges
    // read as solid grey fog)
    if (!this.largeMode) {
      for (const [a, b] of structural) {
        const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 3, (a.z + b.z) / 2);
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(a.x, a.y, a.z), mid, new THREE.Vector3(b.x, b.y, b.z));
        const geo = new THREE.TubeGeometry(curve, 10, 0.2, 6, false);
        const mesh = new THREE.Mesh(geo, this.branchMaterial());
        mesh.userData.sharedMat = true;
        this.branchGroup.add(mesh);
      }
    } else if (structural.length) {
      // one draw call for every branch: unit cylinder (base at origin,
      // pointing +Y) scaled to each edge's length and rotated into place
      const geo = new THREE.CylinderGeometry(0.16, 0.16, 1, 5, 1, true);
      geo.translate(0, 0.5, 0);
      const inst = new THREE.InstancedMesh(geo, this.branchMaterial(), structural.length);
      inst.userData.sharedMat = true;
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      const dir = new THREE.Vector3();
      const org = new THREE.Vector3();
      const scl = new THREE.Vector3();
      for (let i = 0; i < structural.length; i++) {
        const a = structural[i][0];
        const b = structural[i][1];
        dir.set(b.x - a.x, b.y - a.y, b.z - a.z);
        const len = dir.length() || 0.001;
        q.setFromUnitVectors(up, dir.multiplyScalar(1 / len));
        org.set(a.x, a.y, a.z);
        scl.set(1, len, 1);
        m.compose(org, q, scl);
        inst.setMatrixAt(i, m);
      }
      inst.instanceMatrix.needsUpdate = true;
      this.branchGroup.add(inst);
    }
    // cross-links: subtle dashed-look lines (lower opacity)
    const cpts = [];
    for (const [a, b] of cross) { cpts.push(a.x, a.y, a.z, b.x, b.y, b.z); }
    if (cpts.length) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(cpts, 3));
      const lines = new THREE.LineSegments(geo, this.lineMaterial(0.28));
      lines.userData.sharedMat = true;
      this.crossGroup.add(lines);
    }
  }

  private branchMaterial(): any {
    if (!this.matCache['__branch']) {
      this.matCache['__branch'] = new THREE.MeshStandardMaterial({
        color: 0x8a93a6, roughness: 0.9, metalness: 0,
      });
    }
    return this.matCache['__branch'];
  }

  private lineMaterial(opacity: number): any {
    const key = '__line' + opacity;
    if (!this.matCache[key]) {
      this.matCache[key] = new THREE.LineBasicMaterial({
        color: 0x8a93a6, transparent: true, opacity,
      });
    }
    return this.matCache[key];
  }

  // ----------------------------------------------------------------
  // labels — canvas sprites, distance-culled, no DOM per node
  // ----------------------------------------------------------------

  private labelTexture(text: string): any {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = '28px system-ui, sans-serif';
    ctx.font = font;
    const w = Math.min(560, Math.max(80, ctx.measureText(text).width + 24));
    canvas.width = w;
    canvas.height = 44;
    ctx.font = font;
    const dark = this.scene.background && this.scene.background.r < 0.5;
    ctx.fillStyle = dark ? 'rgba(20,24,31,0.72)' : 'rgba(255,255,255,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dark ? '#e6eaf0' : '#1c2430';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.length > 40 ? text.slice(0, 39) + '…' : text, 12, 23);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    return tex;
  }

  /** create/refresh label sprites; when force, rebuild all */
  /**
   * Camera-aware labels: sprites exist only for the nodes nearest the
   * camera and are created/evicted as it moves — wherever the user looks,
   * the surrounding content is titled. (The old scheme pre-built sprites
   * for the first N docs BY ID, so on a large map virtually nothing near
   * the camera ever had text.)
   */
  public updateLabels(force?: boolean) {
    if (!this.available) { return; }
    if (force) {
      this.labelSprites.forEach((sprite) => {
        this.labelGroup.remove(sprite);
        sprite.material.map.dispose();
        sprite.material.dispose();
      });
      this.labelSprites.clear();
    }
    this.lastLabelCull = 0;
    this.cullLabels();
    this.requestRender();
  }

  private ensureLabelSprite(id: number): any {
    let sprite = this.labelSprites.get(id);
    if (sprite) { return sprite; }
    const doc = this.docsById && this.docsById.get(id);
    if (!doc || !doc.title) { return undefined; }
    const tex = this.labelTexture(doc.title);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    sprite = new THREE.Sprite(mat);
    // bottom-center anchor: the label visibly sits ON its node and
    // moves with it, instead of floating detached above the scene
    sprite.center.set(0.5, 0);
    const aspect = tex.image.width / tex.image.height;
    sprite.scale.set(5.2 * aspect, 5.2, 1);
    sprite.userData = { id };
    this.labelGroup.add(sprite);
    this.labelSprites.set(id, sprite);
    return sprite;
  }

  // ----------------------------------------------------------------
  // selection / hover / drag
  // ----------------------------------------------------------------

  public setSelection(ids: number[]) {
    this.selectionIds = new Set(ids);
    this.nodeMeshes.forEach((mesh, id) => {
      const selected = this.selectionIds.has(id);
      const hovered = id === this.hoverId;
      if (selected || hovered) {
        if (mesh.material.userData !== 'own') {
          mesh.material = mesh.material.clone();
          mesh.material.userData = 'own';
          mesh.userData.sharedMat = false;
        }
        mesh.material.emissive = new THREE.Color(selected ? 0x2f6fed : 0x777777);
        mesh.material.emissiveIntensity = selected ? 0.55 : 0.25;
      } else if (mesh.material.userData === 'own') {
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
      }
    });
    this.requestRender();
  }

  private pick(evt: MouseEvent): number {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.nodeGroup.children, false);
    return hits.length ? hits[0].object.userData.id : 0;
  }

  private bindPointerEvents() {
    const el = this.renderer.domElement;
    let downId = 0;
    let downAt = null;
    let moved = false;
    el.addEventListener('pointerdown', (evt: any) => {
      downId = this.pick(evt);
      downAt = { x: evt.clientX, y: evt.clientY };
      moved = false;
      if (downId && this.selectionIds.has(downId)) {
        // dragging a selected node: disable orbit, drag on camera plane
        this.controls.enabled = false;
        const mesh = this.nodeMeshes.get(downId);
        const plane = new THREE.Plane();
        const normal = new THREE.Vector3();
        this.camera.getWorldDirection(normal);
        plane.setFromNormalAndCoplanarPoint(normal, mesh.position);
        this.dragState = { id: downId, plane, mesh };
      }
    });
    el.addEventListener('pointermove', (evt: any) => {
      if (downAt && (Math.abs(evt.clientX - downAt.x) > 3 || Math.abs(evt.clientY - downAt.y) > 3)) {
        moved = true;
      }
      if (this.dragState && moved) {
        const rect = el.getBoundingClientRect();
        this.pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hit = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.dragState.plane, hit)) {
          this.dragState.mesh.position.copy(hit);
          const sprite = this.labelSprites.get(this.dragState.id);
          if (sprite) { sprite.position.set(hit.x, hit.y + 3.4, hit.z); }
          this.requestRender();
        }
      } else if (!downAt) {
        const id = this.pick(evt);
        if (id !== this.hoverId) {
          this.hoverId = id;
          el.style.cursor = id ? 'pointer' : '';
          this.setSelection(Array.from(this.selectionIds));
          this.onHover(id);
        }
      }
    });
    el.addEventListener('pointerup', (evt: any) => {
      if (this.dragState && moved) {
        const m = this.dragState.mesh.position;
        const id = this.dragState.id;
        this.positions.set(id, { x: m.x, y: m.y, z: m.z });
        this.rebuildEdgesFor();
        this.onDragEnd(id, { x: m.x, y: m.y, z: m.z });
      } else if (!moved) {
        if (downId) {
          this.onSelect(downId, evt.shiftKey || evt.ctrlKey || evt.metaKey);
        } else {
          this.onBackgroundClick();
        }
      }
      this.dragState = null;
      this.controls.enabled = true;
      downAt = null;
      downId = 0;
    });
    el.addEventListener('dblclick', (evt: any) => {
      const id = this.pick(evt);
      if (id) {
        this.focusNode(id);
        this.onDoubleClick(id);
      }
    });
  }

  /** cheap edge refresh after a drag (full rebuild of the line groups) */
  private rebuildEdgesFor() {
    for (const group of [this.branchGroup, this.crossGroup]) {
      const children = group.children.slice();
      for (const c of children) {
        group.remove(c);
        if (c.geometry) { c.geometry.dispose(); }
      }
    }
    this.buildBranches();
  }

  // ----------------------------------------------------------------
  // camera helpers
  // ----------------------------------------------------------------

  public focusNode(id: number) {
    const p = this.positions.get(id);
    if (!p) { return; }
    this.controls.target.set(p.x, p.y, p.z);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.camera.position.set(p.x + dir.x * 40, p.y + dir.y * 40, p.z + dir.z * 40);
    this.controls.update();
    this.requestRender();
  }

  public frameAll() {
    if (!this.positions.size) { return; }
    const box = new THREE.Box3();
    // NOTE: never use for..of over Maps here — the legacy TS target (es5,
    // no downlevelIteration) silently compiles it to a broken loop
    this.positions.forEach((p) => box.expandByPoint(new THREE.Vector3(p.x, p.y, p.z)));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length() || 100;
    // large maps (tens of thousands of nodes) span thousands of units; the
    // default 8000 cap would clamp the camera inside the cloud. Grow the
    // zoom-out limit to fit whatever we are framing.
    this.controls.maxDistance = Math.max(8000, size * 1.6);
    this.controls.target.copy(center);
    this.camera.position.set(center.x + size * 0.35, center.y + size * 0.45, center.z + size * 0.7);
    this.controls.update();
    this.requestRender();
  }

  /**
   * Initial view for a freshly opened map with no saved camera. Framing the
   * ENTIRE map is useless at scale — a 40k-node map spans ~8000 units while
   * a node is ~6 units, so every node would be sub-pixel (a white void).
   * Instead land on the largest component's root and its first two levels of
   * branches: the recognizable "central concept + outward branches" view.
   * `Frame all` remains one click away for the whole-galaxy overview.
   */
  public frameInitial() {
    if (!this.positions.size) { return; }
    const h = this.hierarchy;
    if (!h || !h.roots || !h.roots.length) { this.frameAll(); return; }
    // root of the LARGEST component
    let bestRoot = h.roots[0];
    let bestSize = -1;
    const comps = h.components || [];
    for (let i = 0; i < h.roots.length; i++) {
      const sz = comps[i] ? comps[i].length : 0;
      if (sz > bestSize) { bestSize = sz; bestRoot = h.roots[i]; }
    }
    // collect the root + two levels of descendants
    const ids = [bestRoot];
    const kids = (h.childrenOf && h.childrenOf.get(bestRoot)) || [];
    for (let i = 0; i < kids.length; i++) {
      ids.push(kids[i]);
      const gk = (h.childrenOf && h.childrenOf.get(kids[i])) || [];
      for (let j = 0; j < gk.length; j++) { ids.push(gk[j]); }
    }
    const box = new THREE.Box3();
    for (let i = 0; i < ids.length; i++) {
      const p = this.positions.get(ids[i]);
      if (p) { box.expandByPoint(new THREE.Vector3(p.x, p.y, p.z)); }
    }
    if (box.isEmpty()) { this.frameAll(); return; }
    const center = box.getCenter(new THREE.Vector3());
    // keep a floor so a lone root (no children) still gets a sensible zoom
    const size = Math.max(box.getSize(new THREE.Vector3()).length(), 120);
    this.controls.maxDistance = Math.max(8000, size * 4);
    this.controls.target.copy(center);
    this.camera.position.set(center.x + size * 0.4, center.y + size * 0.55, center.z + size * 0.9);
    this.controls.update();
    this.requestRender();
  }

  public resetView() { this.frameAll(); }

  public getCameraState(): any {
    return {
      position: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
    };
  }

  public setCameraState(state: any) {
    if (!state || !state.position) { this.frameInitial(); return; }
    // stale-camera guard: a camera saved for a different layout, preset or
    // viewport can point at empty space thousands of units from where the
    // content now is — the user would be dropped into a white void. Only
    // restore it if it still relates to the current content bounds.
    if (this.positions.size) {
      const box = new THREE.Box3();
      this.positions.forEach((p) => box.expandByPoint(new THREE.Vector3(p.x, p.y, p.z)));
      const center = box.getCenter(new THREE.Vector3());
      const diag = box.getSize(new THREE.Vector3()).length() || 100;
      const target = new THREE.Vector3().fromArray(state.target || [0, 0, 0]);
      const eye = new THREE.Vector3().fromArray(state.position);
      if (target.distanceTo(center) > diag * 1.5 + 60
        || eye.distanceTo(center) > diag * 4 + 240) {
        this.frameInitial();
        return;
      }
      // in-bounds is not enough: a camera saved against a different data
      // set (e.g. when the scene held only the 2D-viewport subset) can sit
      // inside the cloud yet look at nothing. Only restore it if actual
      // content is near its target; otherwise land on the main cluster.
      const near = Math.max(eye.distanceTo(target) * 1.5, 60);
      let visible = 0;
      this.positions.forEach((p) => {
        if (visible < 5 && target.distanceTo(new THREE.Vector3(p.x, p.y, p.z)) < near) {
          visible++;
        }
      });
      if (visible < 5 && this.positions.size > 10) {
        this.frameInitial();
        return;
      }
      // a valid saved camera may still have been captured under the old 8000
      // cap; make sure it isn't clamped now
      this.controls.maxDistance = Math.max(8000, diag * 1.6);
    }
    this.camera.position.fromArray(state.position);
    this.controls.target.fromArray(state.target || [0, 0, 0]);
    this.controls.update();
    this.requestRender();
  }

  // ----------------------------------------------------------------
  // render loop (on demand)
  // ----------------------------------------------------------------

  public requestRender() { this.needsRender = true; }

  private lastLabelCull = 0;

  /**
   * Distance-based label policy: only the labels nearest the camera stay
   * visible (plus selected/hovered), keeping large maps legible instead
   * of a label soup. Throttled — runs at most every 250ms of movement.
   */
  private cullLabels() {
    const now = performance.now();
    // throttled: keep the render loop hot so the skipped update happens
    // right after the window elapses (otherwise a jump straight after an
    // update would leave stale labels frozen on screen)
    if (now - this.lastLabelCull < 250) { this.needsRender = true; return; }
    this.lastLabelCull = now;
    const camPos = this.camera.position;
    const budget = this.largeMode ? 220 : 300;
    // nearest nodes to the camera (single pass over positions, ~ms at 40k)
    const near: Array<{ id: number, d: number }> = [];
    const v = new THREE.Vector3();
    this.positions.forEach((p, id) => {
      const d = camPos.distanceTo(v.set(p.x, p.y, p.z));
      if (d < 420) { near.push({ id, d }); }
    });
    near.sort((a, b) => a.d - b.d);
    const chosen = new Set<number>();
    for (let i = 0; i < near.length && chosen.size < budget; i++) {
      chosen.add(near[i].id);
    }
    this.selectionIds.forEach((id) => chosen.add(id));
    if (this.hoverId) { chosen.add(this.hoverId); }
    // hide everything else; evict far-away sprites to bound memory
    this.labelSprites.forEach((sprite, id) => {
      if (!chosen.has(id)) {
        if (this.labelSprites.size > 700) {
          this.labelGroup.remove(sprite);
          sprite.material.map.dispose();
          sprite.material.dispose();
          this.labelSprites.delete(id);
        } else if (sprite.visible) {
          sprite.visible = false;
          this.needsRender = true;
        }
      }
    });
    chosen.forEach((id) => {
      const sprite = this.ensureLabelSprite(id);
      const p = this.positions.get(id);
      if (!sprite || !p) { return; }
      sprite.position.set(p.x, p.y + 3.4, p.z);
      if (!sprite.visible) {
        sprite.visible = true;
        this.needsRender = true;
      }
      // gentle distance attenuation so far labels do not dominate
      const d = sprite.position.distanceTo(camPos);
      const s = Math.max(0.7, Math.min(1.6, d / 140));
      const aspect = sprite.material.map.image.width / sprite.material.map.image.height;
      sprite.scale.set(5.2 * aspect * s, 5.2 * s, 1);
    });
  }

  private startLoop() {
    if (this.rafActive) { return; }
    this.rafActive = true;
    const tick = () => {
      if (this.disposed) { return; }
      const damping = this.controls && this.controls.update();
      // re-evaluate labels on ANY view change (orbit damping ticks AND
      // programmatic camera moves like frame/focus, which only set
      // needsRender) — throttled internally to 250 ms
      if (damping || this.needsRender) { this.cullLabels(); }
      if (this.needsRender || damping) {
        this.needsRender = false;
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  public dispose() {
    this.disposed = true;
    window.removeEventListener('resize', this.resizeHandler);
    this.clearScene();
    for (const k of Object.keys(this.geoCache)) { this.geoCache[k].dispose(); }
    for (const k of Object.keys(this.matCache)) { this.matCache[k].dispose(); }
    this.geoCache = {};
    this.matCache = {};
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
    this.available = false;
  }
}
