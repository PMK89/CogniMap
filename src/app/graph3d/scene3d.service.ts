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
  public onDragEnd: (id: number, pos: { x: number, y: number, z: number },
    movedNodes?: Array<{ id: number, pos: { x: number, y: number, z: number } }>) => void = () => undefined;
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
  private sheetTexts: Map<number, any[]> = new Map();
  private richPending: Set<number> = new Set();
  private lastBillboardPos: any = null;
  private cullPending = false;
  // far-field sheet pool: ONE InstancedMesh renders every sheet that is not
  // near the camera (one draw call instead of tens of thousands). Near
  // sheets are "promoted" to individual meshes so they can carry textures.
  private sheetInstances: any = null;
  private instanceIds: number[] = [];
  private instanceIndexById: Map<number, number> = new Map();
  private promoted: Set<number> = new Set();
  private sheetDims: Map<number, any> = new Map();
  // 2D-parity family: sheets lie FLAT on the map plane (like the 2D canvas
  // seen from above) instead of billboarding toward the camera
  private flatMode = false;
  public crossVisible = true;
  private highlightGroup: any;
  private branchGroup: any;
  private crossGroup: any;
  private overviewGroup: any;
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
  private rootMode = false;
  private branchSizes: any = new Map();
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
    this.highlightGroup = new THREE.Group();
    this.overviewGroup = new THREE.Group();
    this.scene.add(this.branchGroup, this.crossGroup, this.overviewGroup, this.highlightGroup, this.nodeGroup, this.labelGroup);

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
    this.updateRootFog();
    this.requestRender();
  }

  /**
   * Root-network uses a short focus fog to suppress unrelated far sheets,
   * but restores the normal long view at overview range. The fog-free
   * summary skeleton remains visible at every overview distance.
   */
  private updateRootFog() {
    if (!this.scene) { return; }
    if (!this.rootMode) {
      this.scene.fog = new THREE.Fog(this.scene.background, 900, 4000);
      return;
    }
    const distance = this.camera && this.controls
      ? this.camera.position.distanceTo(this.controls.target) : 400;
    this.scene.fog = distance < 400
      ? new THREE.Fog(this.scene.background, 80, 400)
      : new THREE.Fog(this.scene.background, 120, 4000);
  }

  // ----------------------------------------------------------------
  // scene construction
  // ----------------------------------------------------------------

  /** rebuild the scene from legacy documents + persisted viz state */
  public setDocs(docs: any[], viz: Viz3dState) {
    if (!this.available) { return; }
    this.clearScene();
    const preset = (viz && viz.preset) || '2d-parity';
    this.rootMode = preset === 'root-network';
    this.updateRootFog();
    this.flatMode = preset === '2d-parity' || preset === 'layered-2.5d'
      || preset === 'legacy-planar' || preset === 'layered-depth';
    const result = core.computeLayout(docs, preset, viz && viz.positions);
    this.graph = result.graph;
    this.hierarchy = result.hierarchy;
    this.branchSizes = core.subtreeSizes(this.hierarchy);
    this.positions = result.positions;
    this.docsById = result.graph.nodes;
    const n = result.graph.nodes.size;
    this.largeMode = n > 800;

    // fill rate dominates on huge maps — cap the pixel ratio there
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.largeMode ? 1.5 : 2));

    const sheetItems = [];
    for (const doc of result.graph.nodeList) {
      const p = result.positions.get(doc.id);
      if (this.shapeFor(doc, viz) === 'sheet') { sheetItems.push([doc, p]); }
      else { this.addNodeMesh(doc, p, viz); }
    }
    this.buildSheetPool(sheetItems);
    this.buildBranches();
    this.buildOverviewSkeleton();
    this.updateLabels(true);
    this.requestRender();
  }

  /** all far sheets in one instanced draw call, colored per node */
  private buildSheetPool(items: any[]) {
    this.sheetInstances = null;
    this.instanceIds = [];
    this.instanceIndexById.clear();
    this.promoted.clear();
    this.sheetDims.clear();
    if (!items.length) { return; }
    const geo = this.geometryFor('sheet');
    if (!this.matCache['__sheetpool']) {
      this.matCache['__sheetpool'] = new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.85, metalness: 0.05,
      });
    }
    const inst = new THREE.InstancedMesh(geo, this.matCache['__sheetpool'], items.length);
    inst.userData = { isSheetPool: true, shared: true, sharedMat: true };
    const m = new THREE.Matrix4();
    const q = this.flatMode ? this.flatQuat() : new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const pv = new THREE.Vector3();
    const col = new THREE.Color();
    for (let i = 0; i < items.length; i++) {
      const doc = items[i][0];
      const p = items[i][1];
      const s = core.sheetSize(doc);
      this.sheetDims.set(doc.id, s);
      this.instanceIds.push(doc.id);
      this.instanceIndexById.set(doc.id, i);
      m.compose(pv.set(p.x, p.y, p.z), q, sc.set(s.w, s.h, 0.5));
      inst.setMatrixAt(i, m);
      inst.setColorAt(i, col.set(this.colorFor(doc)));
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) { inst.instanceColor.needsUpdate = true; }
    this.nodeGroup.add(inst);
    this.sheetInstances = inst;
  }

  /** flat-on-the-map orientation: exactly the 2D canvas seen from above */
  private flatQuat(): any {
    return new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  }

  /** near sheet: swap the instance for an individual mesh (texturable) */
  private promoteSheet(id: number): any {
    if (this.promoted.has(id)) { return this.nodeMeshes.get(id); }
    const doc = this.docsById && this.docsById.get(id);
    const p = this.positions.get(id);
    const s = this.sheetDims.get(id);
    const idx = this.instanceIndexById.get(id);
    if (!doc || !p || !s || idx === undefined || !this.sheetInstances) { return undefined; }
    const mesh = new THREE.Mesh(this.geometryFor('sheet'), this.materialFor(this.colorFor(doc), 'sheet'));
    mesh.position.set(p.x, p.y, p.z);
    mesh.scale.set(s.w, s.h, 0.5);
    if (this.flatMode) {
      mesh.rotation.x = -Math.PI / 2;
    } else {
      const cam = this.camera.position;
      mesh.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z);
    }
    mesh.userData = { id, shape: 'sheet', shared: true, sharedMat: true };
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.nodeGroup.add(mesh);
    this.nodeMeshes.set(id, mesh);
    // hide the pooled instance
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this.sheetInstances.setMatrixAt(idx, zero);
    this.sheetInstances.instanceMatrix.needsUpdate = true;
    this.promoted.add(id);
    return mesh;
  }

  /** sheet left the near set: back into the instanced pool */
  private demoteSheet(id: number) {
    if (!this.promoted.has(id)) { return; }
    this.removeSheetText(id);
    const mesh = this.nodeMeshes.get(id);
    if (mesh) {
      this.nodeGroup.remove(mesh);
      if (!mesh.userData.sharedMat) { mesh.material.dispose(); }
      this.nodeMeshes.delete(id);
    }
    const idx = this.instanceIndexById.get(id);
    const p = this.positions.get(id);
    const s = this.sheetDims.get(id);
    if (idx !== undefined && p && s && this.sheetInstances) {
      const cam = this.camera.position;
      const q = this.flatMode ? this.flatQuat() : new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), Math.atan2(cam.x - p.x, cam.z - p.z));
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(s.w, s.h, 0.5));
      this.sheetInstances.setMatrixAt(idx, m);
      this.sheetInstances.instanceMatrix.needsUpdate = true;
    }
    this.promoted.delete(id);
  }

  private clearScene() {
    for (const group of [this.nodeGroup, this.branchGroup, this.crossGroup, this.overviewGroup, this.labelGroup, this.highlightGroup]) {
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
    // sheet text faces were children of the removed node meshes — release
    // their textures/materials explicitly (plane geometry is shared)
    this.sheetTexts.forEach((faces) => {
      for (const f of faces) {
        f.material.map.dispose();
        f.material.dispose();
      }
    });
    this.sheetTexts.clear();
    this.sheetInstances = null;
    this.instanceIds = [];
    this.instanceIndexById.clear();
    this.promoted.clear();
    this.sheetDims.clear();
  }

  /** geometry factory with shared cache */
  private geometryFor(shape: string): any {
    if (this.geoCache[shape]) { return this.geoCache[shape]; }
    let g;
    switch (shape) {
      case 'cube': g = new THREE.BoxGeometry(6, 6, 6); break;
      case 'rounded-box': g = new THREE.BoxGeometry(8, 5, 3); break;
      // unit slab, scaled per node to the real 2D object proportions
      case 'sheet': g = new THREE.BoxGeometry(1, 1, 1); break;
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
    if (doc.types && doc.types[0] === 'q') { return 'octahedron'; }
    if (doc.types && doc.types[0] === 'm') { return 'capsule'; }
    if (!this.flatMode
      && (this.hierarchy && this.hierarchy.roots.indexOf(doc.id) !== -1)) { return 'sphere'; }
    // default: a flat sheet in the proportions of the 2D object that
    // streams the object's REAL 2D rendering (text, LaTeX, images,
    // formulas) onto both faces when near the camera. Content-specific
    // geometric shapes remain available as explicit per-node overrides.
    return 'sheet';
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
    // color1 (the accent/stroke color) gives distinct topic regions at a
    // distance; color0 is often near-black text color and reads as a dark
    // mass (the near cards stream their real 2D rendering anyway)
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
    if (shape === 'sheet') {
      // exact proportions of the real 2D object — shared with the layout's
      // size-aware collision radii so spacing always matches the rendering
      const s = core.sheetSize(doc);
      mesh.scale.set(s.w, s.h, 0.5);
    }
    // static matrices: with tens of thousands of meshes, per-render auto
    // matrix recomposition dominates the frame. Every code path that moves
    // or rotates a node calls updateMatrix() explicitly.
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.nodeGroup.add(mesh);
    this.nodeMeshes.set(doc.id, mesh);
  }

  /**
   * Renders the node's text ONTO the sheet: two text planes hugging the
   * slab's front and back faces (the back one mirrored), so the title is
   * readable from both sides and moves/drags as part of the node itself.
   * Created only for nodes near the camera and evicted with distance.
   */
  private ensureSheetText(id: number) {
    if (this.sheetTexts.has(id)) { return; }
    const mesh = this.nodeMeshes.get(id);
    const doc = this.docsById && this.docsById.get(id);
    // untitled nodes (images, formulas) still get faces: the title card is
    // just the placeholder until the real 2D rendering streams in
    if (!mesh || !doc) { return; }
    const tex = this.sheetTexture(doc, mesh.scale.x / mesh.scale.y);
    const back = tex.clone();
    back.wrapS = THREE.RepeatWrapping;
    back.repeat.x = -1;
    back.needsUpdate = true;
    if (!this.geoCache['__sheetface']) {
      this.geoCache['__sheetface'] = new THREE.PlaneGeometry(1, 1);
    }
    const faces = [];
    [{ t: tex, z: 0.52, ry: 0 }, { t: back, z: -0.52, ry: Math.PI }].forEach((f) => {
      const m = new THREE.Mesh(this.geoCache['__sheetface'],
        new THREE.MeshBasicMaterial({ map: f.t }));
      m.position.z = f.z;
      m.rotation.y = f.ry;
      m.userData = { shared: true }; // plane geometry is cached/shared
      // local transform never changes; the parent's matrix carries drags
      m.matrixAutoUpdate = false;
      m.updateMatrix();
      mesh.add(m); // inherits the node's scale, position and drags
      faces.push(m);
    });
    this.sheetTexts.set(id, faces);
  }

  /**
   * Upgrades a sheet from the quick title card to the node's REAL 2D
   * rendering: `prep` is the pre-rendered SVG of the whole 2D object
   * (LaTeX, chemical formulas, images, styled text). It is intentionally
   * excluded from the bulk graph payload, so it streams in per node for
   * sheets near the camera. External <image> refs are inlined as data
   * URLs (SVG loaded through <img> cannot fetch), then the SVG rasterizes
   * onto both faces.
   */
  private upgradeSheet(id: number) {
    const faces = this.sheetTexts.get(id);
    if (!faces || faces[0].userData.rich || this.richPending.has(id)) { return; }
    if (this.richPending.size >= 6) { return; } // in-flight cap
    this.richPending.add(id);
    fetch('/api/cme/id/' + id)
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        this.richPending.delete(id);
        if (!doc || !doc.prep || !this.sheetTexts.has(id)) { return; }
        this.renderPrepTexture(doc);
      })
      .catch(() => this.richPending.delete(id));
  }

  private renderPrepTexture(doc: any) {
    const w = Math.max(1, (doc.x1 - doc.x0) || 100);
    const h = Math.max(1, (doc.y1 - doc.y0) || 26);
    const pad = 4;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" '
      + 'xmlns:xlink="http://www.w3.org/1999/xlink" '
      + 'viewBox="' + (doc.x0 - pad) + ' ' + (doc.y0 - pad) + ' '
      + (w + 2 * pad) + ' ' + (h + 2 * pad) + '">' + doc.prep + '</svg>';
    this.inlineSvgImages(svg).then((finalSvg) => {
      const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const faces = this.sheetTexts.get(doc.id);
        if (!faces) { return; } // evicted while loading
        const canvas = document.createElement('canvas');
        // resolution scales with the sheet's real size so large diagrams
        // stay sharp at reading distance
        const s = core.sheetSize(doc);
        canvas.width = Math.max(384, Math.min(800, Math.round(s.w * 26)));
        canvas.height = Math.max(56, Math.min(800, Math.round(canvas.width * (h + 2 * pad) / (w + 2 * pad))));
        const ctx = canvas.getContext('2d');
        const dark = this.scene.background && this.scene.background.r < 0.5;
        ctx.fillStyle = dark ? '#14181f' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        // streamed content: skip mipmap generation — halves the GPU upload
        // cost that caused hitches while flying into new areas
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        const back = tex.clone();
        back.wrapS = THREE.RepeatWrapping;
        back.repeat.x = -1;
        back.needsUpdate = true;
        const maps = [tex, back];
        for (let i = 0; i < faces.length; i++) {
          faces[i].material.map.dispose();
          faces[i].material.map = maps[i];
          faces[i].material.needsUpdate = true;
          faces[i].userData.rich = true;
        }
        this.requestRender();
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    });
  }

  /** replaces external image hrefs with data URLs (bounded) */
  private inlineSvgImages(svg: string): Promise<string> {
    const hrefs: string[] = [];
    const re = /(?:xlink:href|href)="([^"]+)"/g;
    let m = re.exec(svg);
    while (m) {
      if (m[1].indexOf('data:') !== 0 && m[1].indexOf('#') !== 0) { hrefs.push(m[1]); }
      m = re.exec(svg);
    }
    if (!hrefs.length) { return Promise.resolve(svg); }
    const uniq = Array.from(new Set(hrefs)).slice(0, 4);
    return Promise.all(uniq.map((u) => fetch(u)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => (b ? new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res([u, fr.result]);
        fr.onerror = () => res([u, null]);
        fr.readAsDataURL(b);
      }) : [u, null]))
      .catch(() => [u, null]),
    )).then((pairs: any[]) => {
      let out = svg;
      for (const [u, data] of pairs) {
        if (data) { out = out.split('"' + u + '"').join('"' + data + '"'); }
      }
      return out;
    });
  }

  private removeSheetText(id: number) {
    const faces = this.sheetTexts.get(id);
    if (!faces) { return; }
    for (const f of faces) {
      if (f.parent) { f.parent.remove(f); }
      f.material.map.dispose();
      f.material.dispose();
    }
    this.sheetTexts.delete(id);
  }

  /** canvas texture mimicking the 2D object: fill color, border, title */
  private sheetTexture(doc: any, aspect: number): any {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = Math.max(48, Math.min(220, Math.round(320 / Math.max(1, aspect))));
    const ctx = canvas.getContext('2d');
    const bg = this.colorFor(doc);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    // black or white text depending on background luminance
    const c = parseInt(bg.slice(1), 16);
    const lum = 0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255);
    ctx.fillStyle = lum > 140 ? '#14181f' : '#f4f6f9';
    const title = String(doc.title || '');
    let size = Math.min(Math.round(canvas.height * 0.5), 46);
    ctx.font = size + 'px system-ui, sans-serif';
    while (size > 15 && ctx.measureText(title).width > canvas.width - 24) {
      size -= 2;
      ctx.font = size + 'px system-ui, sans-serif';
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const shown = ctx.measureText(title).width > canvas.width - 24
      ? title.slice(0, Math.floor(title.length * (canvas.width - 40) / ctx.measureText(title).width)) + '…'
      : title;
    ctx.fillText(shown, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    return tex;
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
      for (const [a, b, edge] of structural) {
        const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 3, (a.z + b.z) / 2);
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(a.x, a.y, a.z), mid, new THREE.Vector3(b.x, b.y, b.z));
        const geo = new THREE.TubeGeometry(curve, 10, this.branchRadius(edge), 6, false);
        const mesh = new THREE.Mesh(geo, this.branchMaterial());
        mesh.userData.sharedMat = true;
        this.branchGroup.add(mesh);
      }
    } else if (structural.length) {
      // one draw call for every branch: unit cylinder (base at origin,
      // pointing +Y) scaled to each edge's length and rotated into place
      const geo = new THREE.CylinderGeometry(this.rootMode ? 0.06 : 0.09, 0.09, 1, 5, 1, true);
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
        let a = structural[i][0];
        let b = structural[i][1];
        const edge = structural[i][2];
        // The tapered cylinder is thick at its local base.  Structural links
        // may be stored child-to-parent, so orient that base at the parent.
        if (this.rootMode && this.hierarchy.parentOf.get(edge.source) === edge.target) {
          a = structural[i][1]; b = structural[i][0];
        }
        dir.set(b.x - a.x, b.y - a.y, b.z - a.z);
        const len = dir.length() || 0.001;
        q.setFromUnitVectors(up, dir.multiplyScalar(1 / len));
        org.set(a.x, a.y, a.z);
        const radiusScale = this.rootMode ? this.branchRadius(edge) / 0.09 : 1;
        scl.set(radiusScale, len, radiusScale);
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
      const lines = new THREE.LineSegments(geo, this.lineMaterial(this.rootMode ? 0.10 : 0.28));
      lines.userData.sharedMat = true;
      this.crossGroup.add(lines);
    }
  }

  /** A readable, fixed-pixel structural summary for root-network overviews. */
  private buildOverviewSkeleton() {
    if (!this.rootMode || !this.hierarchy || !this.overviewGroup) { return; }
    const depth = new Map<number, number>();
    const queue = this.hierarchy.roots.slice();
    for (const id of queue) { depth.set(id, 0); }
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      const d = depth.get(id) || 0;
      for (const child of this.hierarchy.childrenOf.get(id) || []) {
        depth.set(child, d + 1);
        queue.push(child);
      }
    }
    const candidates: any[] = [];
    for (const edge of this.graph.edges) {
      if (edge.cross) { continue; }
      const child = this.hierarchy.parentOf.get(edge.target) === edge.source ? edge.target
        : (this.hierarchy.parentOf.get(edge.source) === edge.target ? edge.source : undefined);
      if (child === undefined || child === null) { continue; }
      const a = this.positions.get(edge.source), b = this.positions.get(edge.target);
      if (!a || !b) { continue; }
      candidates.push({ a, b, child, size: this.branchSizes.get(child) || 1, depth: depth.get(child) || 0 });
    }
    // Strongest limbs first: two small draw calls, never a 40k-edge hairball.
    candidates.sort((a, b) => b.size - a.size || a.depth - b.depth || a.child - b.child);
    const limbs = candidates.slice(0, 700);
    if (!limbs.length) { return; }
    const linePts: number[] = [];
    const pointPts: number[] = [];
    const seen = new Set<string>();
    for (const limb of limbs) {
      linePts.push(limb.a.x, limb.a.y, limb.a.z, limb.b.x, limb.b.y, limb.b.z);
      for (const p of [limb.a, limb.b]) {
        const key = p.x + ':' + p.y + ':' + p.z;
        if (!seen.has(key)) { seen.add(key); pointPts.push(p.x, p.y, p.z); }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
    const lines = new THREE.LineSegments(lineGeo,
      new THREE.LineBasicMaterial({ color: 0x2f6fed, transparent: true, opacity: 0.82, depthTest: false, depthWrite: false, fog: false }));
    lines.renderOrder = 10;
    lines.userData.overview = true;
    this.overviewGroup.add(lines);
    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.Float32BufferAttribute(pointPts, 3));
    const points = new THREE.Points(pointGeo,
      new THREE.PointsMaterial({ color: 0x74a5ff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.62, depthTest: false, depthWrite: false, fog: false }));
    points.renderOrder = 11;
    points.userData.overview = true;
    this.overviewGroup.add(points);
  }

  public getNodeCount(): number { return this.positions.size; }

  private branchRadius(edge: any): number {
    if (!this.rootMode) return 0.2;
    const child = this.hierarchy.parentOf.get(edge.target) === edge.source ? edge.target : edge.source;
    return Math.min(2.5, 0.10 + 0.10 * Math.cbrt(this.branchSizes.get(child) || 1));
  }

  private branchMaterial(): any {
    if (!this.matCache['__branch']) {
      // light and slightly translucent: connections should recede behind
      // the content, not read as dark scaffolding in the foreground
      // the 2D map draws its links in blue — keep that identity in 3D
      this.matCache['__branch'] = new THREE.MeshStandardMaterial({
        color: 0x5b74cc, roughness: 1, metalness: 0,
        transparent: true, opacity: 0.6,
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
      const ids: number[] = [];
      this.sheetTexts.forEach((f, id) => ids.push(id));
      for (const id of ids) { this.removeSheetText(id); }
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

  /** the selected node's own links become prominent */
  private rebuildSelectionLinks(ids: number[]) {
    if (!this.highlightGroup) { return; }
    const old = this.highlightGroup.children.slice();
    for (const c of old) {
      this.highlightGroup.remove(c);
      if (c.geometry) { c.geometry.dispose(); }
      if (c.material && !c.userData.sharedMat) { c.material.dispose(); }
    }
    if (!ids.length || !this.graph) { return; }
    const idset = new Set(ids);
    const pts: number[] = [];
    for (const e of this.graph.edges) {
      if (!idset.has(e.source) && !idset.has(e.target)) { continue; }
      const a = this.positions.get(e.source);
      const b = this.positions.get(e.target);
      if (a && b) { pts.push(a.x, a.y, a.z, b.x, b.y, b.z); }
    }
    if (!pts.length) { return; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    if (!this.matCache['__sellink']) {
      this.matCache['__sellink'] = new THREE.LineBasicMaterial({
        color: 0x2f6fed, transparent: true, opacity: 0.95,
      });
    }
    const lines = new THREE.LineSegments(geo, this.matCache['__sellink']);
    lines.userData.sharedMat = true;
    this.highlightGroup.add(lines);
  }

  public setSelection(ids: number[]) {
    this.selectionIds = new Set(ids);
    // a selected far sheet is promoted immediately so it can highlight
    for (const id of ids) {
      if (this.instanceIndexById.has(id) && !this.promoted.has(id)) { this.promoteSheet(id); }
    }
    this.rebuildSelectionLinks(ids);
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
    if (!hits.length) { return 0; }
    const h = hits[0];
    if (h.object.userData.isSheetPool && h.instanceId !== undefined) {
      return this.instanceIds[h.instanceId] || 0;
    }
    return h.object.userData.id || 0;
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
        // tree drag: the whole subtree follows the dragged node, each
        // descendant keeping its offset relative to the parent
        const origin = this.positions.get(downId) || mesh.position;
        const subtree = [];
        this.subtreeIds(downId).forEach((did) => {
          const dp = this.positions.get(did);
          if (dp) {
            // mesh is undefined for pooled (instanced) descendants: they
            // move on release via the instance matrices
            subtree.push({ id: did, mesh: this.nodeMeshes.get(did), off: {
              x: dp.x - origin.x, y: dp.y - origin.y, z: dp.z - origin.z,
            } });
          }
        });
        this.dragState = { id: downId, plane, mesh, subtree };
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
          this.dragState.mesh.updateMatrix();
          const sprite = this.labelSprites.get(this.dragState.id);
          if (sprite) { sprite.position.set(hit.x, hit.y + 3.4, hit.z); }
          // children move relative to the parent (pooled instances follow
          // on release — their matrices update once in pointerup)
          for (let i = 0; i < this.dragState.subtree.length; i++) {
            const s = this.dragState.subtree[i];
            if (!s.mesh) { continue; }
            s.mesh.position.set(hit.x + s.off.x, hit.y + s.off.y, hit.z + s.off.z);
            s.mesh.updateMatrix();
            const sp = this.labelSprites.get(s.id);
            if (sp) { sp.position.set(s.mesh.position.x, s.mesh.position.y + 3.4, s.mesh.position.z); }
          }
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
        const movedNodes = [{ id, pos: { x: m.x, y: m.y, z: m.z } }];
        for (let i = 0; i < this.dragState.subtree.length; i++) {
          const s = this.dragState.subtree[i];
          const sp = { x: m.x + s.off.x, y: m.y + s.off.y, z: m.z + s.off.z };
          this.positions.set(s.id, sp);
          movedNodes.push({ id: s.id, pos: sp });
          // pooled descendants: update their instance matrix now
          const idx = this.instanceIndexById.get(s.id);
          if (!s.mesh && idx !== undefined && this.sheetInstances) {
            const dims = this.sheetDims.get(s.id);
            if (dims) {
              const cam = this.camera.position;
              const q = this.flatMode ? this.flatQuat()
                : new THREE.Quaternion().setFromAxisAngle(
                  new THREE.Vector3(0, 1, 0), Math.atan2(cam.x - sp.x, cam.z - sp.z));
              const mm = new THREE.Matrix4().compose(
                new THREE.Vector3(sp.x, sp.y, sp.z), q,
                new THREE.Vector3(dims.w, dims.h, 0.5));
              this.sheetInstances.setMatrixAt(idx, mm);
            }
          }
        }
        if (this.sheetInstances) { this.sheetInstances.instanceMatrix.needsUpdate = true; }
        this.rebuildEdgesFor();
        this.onDragEnd(id, { x: m.x, y: m.y, z: m.z }, movedNodes);
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
  /** all descendants of a node in the derived hierarchy (excluding it) */
  private subtreeIds(id: number): number[] {
    const out: number[] = [];
    if (!this.hierarchy || !this.hierarchy.childrenOf) { return out; }
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      const kids = this.hierarchy.childrenOf.get(cur) || [];
      for (let i = 0; i < kids.length; i++) {
        out.push(kids[i]);
        stack.push(kids[i]);
      }
    }
    return out;
  }

  private rebuildEdgesFor() {
    for (const group of [this.branchGroup, this.crossGroup, this.overviewGroup]) {
      const children = group.children.slice();
      for (const c of children) {
        group.remove(c);
        if (c.geometry) { c.geometry.dispose(); }
        if (c.userData.overview && c.material) { c.material.dispose(); }
      }
    }
    this.buildBranches();
    this.buildOverviewSkeleton();
  }

  // ----------------------------------------------------------------
  // camera helpers
  // ----------------------------------------------------------------

  public focusNode(id: number) {
    const p = this.positions.get(id);
    if (!p) { return; }
    // Preserve the current viewing bearing before changing the target.  Using
    // the new target here can turn a distant overview eye vector into an
    // arbitrary direction and leave the selected node outside the frustum.
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.controls.target.set(p.x, p.y, p.z);
    this.camera.position.set(p.x + dir.x * 40, p.y + dir.y * 40, p.z + dir.z * 40);
    this.updateCameraClip(40);
    this.updateRootFog();
    this.controls.update();
    this.requestRender();
  }

  public frameSubtree(id: number) {
    this.frameNodes([id].concat(this.subtreeIds(id)));
  }

  private frameNodes(ids: number[]) {
    const box = new THREE.Box3();
    ids.forEach(id => { const p = this.positions.get(id); if (p) box.expandByPoint(new THREE.Vector3(p.x, p.y, p.z)); });
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = Math.max(80, box.getSize(new THREE.Vector3()).length());
    this.controls.maxDistance = Math.max(8000, size * 2);
    this.controls.target.copy(center);
    this.camera.position.set(center.x + size * .45, center.y + size * .35, center.z + size * .7);
    this.updateCameraClip(this.camera.position.distanceTo(center), size);
    this.updateRootFog();
    this.controls.update(); this.requestRender();
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
    this.updateCameraClip(this.camera.position.distanceTo(center), size);
    this.updateRootFog();
    this.controls.update();
    this.requestRender();
  }

  /** keep every fitted volume inside the camera depth range at any map scale */
  private updateCameraClip(distance: number, size = 0) {
    const radius = Math.max(40, size * 0.5);
    const far = distance + radius * 1.5;
    const near = Math.max(0.1, distance - radius * 1.5);
    this.camera.near = Math.min(near, far / 1000);
    this.camera.far = Math.max(50000, far * 1.2);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Initial view for a freshly opened map with no saved camera. Framing the
   * ENTIRE map is useless at scale — a 40k-node map spans ~8000 units while
   * a node is ~6 units, so every node would be sub-pixel (a white void).
   * Instead land on the largest component, which preserves the recognizable
   * branching structure while excluding distant disconnected outliers.
   * `Frame all` remains one click away for the whole-galaxy overview.
   */
  public frameInitial() {
    if (!this.positions.size) { return; }
    if (this.rootMode && this.hierarchy.roots.length) {
      const roots = this.hierarchy.roots.slice().sort((a, b) => this.branchSizes.get(b) - this.branchSizes.get(a) || a - b);
      const root = roots[0];
      // The dominant component is the useful opening overview. On the real
      // map it contains almost every node, while Frame all also includes a
      // ring of tiny disconnected components that shrinks the tree to dust.
      this.frameSubtree(root); return;
    }
    // land on the DENSEST region of the map: a deterministic coarse-grid
    // density pass over all node positions. Framing everything shows
    // sub-pixel nodes, and a component root can sit geographically far
    // from its own children — density is where the map actually lives.
    const CELL = 250;
    const counts: { [k: string]: number } = {};
    const sums: { [k: string]: { x: number, y: number, z: number, n: number } } = {};
    this.positions.forEach((p) => {
      const k = Math.floor(p.x / CELL) + ':' + Math.floor(p.z / CELL);
      counts[k] = (counts[k] || 0) + 1;
      if (!sums[k]) { sums[k] = { x: 0, y: 0, z: 0, n: 0 }; }
      sums[k].x += p.x; sums[k].y += p.y; sums[k].z += p.z; sums[k].n++;
    });
    let bestKey = '';
    let bestCount = -1;
    // deterministic tie-break by key order
    Object.keys(counts).sort().forEach((k) => {
      if (counts[k] > bestCount) { bestCount = counts[k]; bestKey = k; }
    });
    if (!bestKey) { this.frameAll(); return; }
    const s = sums[bestKey];
    const anchor = new THREE.Vector3(s.x / s.n, s.y / s.n, s.z / s.n);
    const size = 420; // comfortable reading distance for the dense area
    this.controls.maxDistance = 8000;
    this.controls.target.copy(anchor);
    if (this.flatMode) {
      // near-top-down at 2D-like magnification: the map plane fills the
      // view like the 2D canvas, with a slight tilt so orbiting stays
      // stable
      const h = 280;
      this.camera.position.set(anchor.x, anchor.y + h, anchor.z + h * 0.28);
    } else {
      this.camera.position.set(anchor.x + size * 0.4, anchor.y + size * 0.55, anchor.z + size * 0.9);
    }
    this.controls.update();
    this.requestRender();
  }

  /** return to the 2D-equivalent viewpoint (top-down over the current spot) */
  public frame2D() {
    const t = this.controls.target;
    const d = Math.max(140, this.camera.position.distanceTo(t));
    this.camera.position.set(t.x, t.y + d, t.z + d * 0.28);
    this.updateRootFog();
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
    this.updateRootFog();
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
    // throttled: remember that work is pending so the loop retries right
    // after the window elapses (setting needsRender instead would be
    // cleared by the same tick's render and the streaming would stall —
    // content then only appeared on hover)
    if (now - this.lastLabelCull < 250) { this.cullPending = true; return; }
    this.lastLabelCull = now;
    this.cullPending = false;
    const camPos = this.camera.position;
    this.updateRootFog();
    // signpost billboarding: sheets rotate around Y toward the camera so
    // they are never seen edge-on as slivers — from every angle the map
    // reads like cards, exactly as in 2D (text planes are children and
    // turn with their node). Only when the camera actually moved, so an
    // idle scene stays idle.
    // cross-links fade out at overview distances (they read as noise) and
    // can be toggled off entirely
    if (this.crossGroup) {
      const cd = camPos.distanceTo(this.controls.target);
      const vis = this.crossVisible && cd < 2200;
      if (this.crossGroup.visible !== vis) {
        this.crossGroup.visible = vis;
        this.needsRender = true;
      }
    }
    if (this.overviewGroup) {
      const distance = camPos.distanceTo(this.controls.target);
      // Small maps have no separate far overview range. Keep their compact
      // structural skeleton visible, while huge maps fade it in only once
      // ordinary geometry has become too small to read.
      const fade = this.largeMode ? Math.max(0, Math.min(1, (distance - 1400) / 800)) : 1;
      const visible = this.rootMode && fade > 0.01;
      if (this.overviewGroup.visible !== visible) {
        this.overviewGroup.visible = visible;
        this.needsRender = true;
      }
      for (const child of this.overviewGroup.children) {
        if (child.material) { child.material.opacity = (child.isPoints ? 0.62 : 0.82) * fade; }
      }
    }
    if (!this.flatMode
      && (!this.lastBillboardPos || this.lastBillboardPos.distanceTo(camPos) > 0.5)) {
      this.lastBillboardPos = camPos.clone();
      this.nodeMeshes.forEach((mesh) => {
        if (mesh.userData.shape === 'sheet') {
          mesh.rotation.y = Math.atan2(camPos.x - mesh.position.x, camPos.z - mesh.position.z);
          mesh.updateMatrix();
        }
      });
      if (this.sheetInstances) {
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        const pv = new THREE.Vector3();
        const sc = new THREE.Vector3();
        for (let i = 0; i < this.instanceIds.length; i++) {
          const id = this.instanceIds[i];
          if (this.promoted.has(id)) { continue; }
          const p = this.positions.get(id);
          const s = this.sheetDims.get(id);
          if (!p || !s) { continue; }
          q.setFromAxisAngle(up, Math.atan2(camPos.x - p.x, camPos.z - p.z));
          m.compose(pv.set(p.x, p.y, p.z), q, sc.set(s.w, s.h, 0.5));
          this.sheetInstances.setMatrixAt(i, m);
        }
        this.sheetInstances.instanceMatrix.needsUpdate = true;
      }
      this.needsRender = true;
    }
    // two tiers: title cards for a wide radius (everything you can make
    // out gets at least its text), full 2D content for the nearest nodes
    const budget = this.largeMode ? 500 : 600;
    const RICH_DIST = 220;
    // nearest nodes to the camera (single pass over positions, ~ms at 40k)
    const near: Array<{ id: number, d: number }> = [];
    const v = new THREE.Vector3();
    this.positions.forEach((p, id) => {
      const d = camPos.distanceTo(v.set(p.x, p.y, p.z));
      if (d < 700) { near.push({ id, d }); }
    });
    near.sort((a, b) => a.d - b.d);
    const chosen = new Set<number>();
    const distOf: { [id: number]: number } = {};
    for (let i = 0; i < near.length && chosen.size < budget; i++) {
      chosen.add(near[i].id);
      distOf[near[i].id] = near[i].d;
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
    // sheets that left the near set go back into the instanced pool
    const toDemote: number[] = [];
    this.promoted.forEach((id) => { if (!chosen.has(id)) { toDemote.push(id); } });
    for (const id of toDemote) { this.demoteSheet(id); this.needsRender = true; }
    // canvas-texture creation is the expensive part — cap it per tick and
    // let the remainder stream in over the next culls (keeps frames smooth
    // while flying instead of one big hitch per area)
    let created = 0;
    chosen.forEach((id) => {
      // sheets carry their text on the node itself
      if (this.instanceIndexById.has(id)) {
        let mesh = this.nodeMeshes.get(id);
        if (!mesh && created < 80) {
          mesh = this.promoteSheet(id);
          created++;
          this.needsRender = true;
        }
        if (!mesh) { return; }
        if (!this.sheetTexts.has(id) && created < 80) {
          this.ensureSheetText(id);
          created++;
          this.needsRender = true;
        }
        // full 2D content (LaTeX/images/formulas) only at reading
        // distance or for the selected/hovered node — large media and
        // chemistry previews must not dominate the overview
        const d = distOf[id];
        if (d === undefined || d < RICH_DIST) {
          this.upgradeSheet(id);
        }
        return;
      }
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
    // the per-tick creation cap was hit or rich fetches are in flight:
    // keep streaming on the next window instead of waiting for movement
    if (created >= 80 || this.richPending.size > 0) { this.cullPending = true; }
  }

  private startLoop() {
    if (this.rafActive) { return; }
    this.rafActive = true;
    const tick = () => {
      if (this.disposed) { return; }
      const damping = this.controls && this.controls.update();
      // re-evaluate labels on ANY view change (orbit damping ticks AND
      // programmatic camera moves like frame/focus, which only set
      // needsRender) and while streaming work is pending — throttled
      // internally to 250 ms
      if (damping || this.needsRender || this.cullPending) { this.cullLabels(); }
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
