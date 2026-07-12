import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Scene3dService } from './scene3d.service';
import { ElementService } from '../shared/element.service';
import { BackendService } from '../shared/backend.service';
import { CMStore } from '../models/CMStore';

const core = require('./graph3d-core');

/**
 * Cmap3dComponent — the 3D workspace.
 *
 * Renders the same domain documents the 2D canvas uses (ngrx `cmes`
 * slice); selection is synchronized through ElementService, so every
 * existing editor, toolbar and widget keeps operating on the node the
 * user picks in 3D. The 2D canvas remains mounted underneath as the
 * planar fallback and legacy renderer.
 */
@Component({
  selector: 'app-cmap3d',
  templateUrl: './cmap3d.component.html',
  styleUrls: ['./cmap3d.component.scss'],
  providers: [Scene3dService],
})
export class Cmap3dComponent implements OnInit, OnDestroy {
  @ViewChild('host') public host: ElementRef;
  public presets: string[] = core.LAYOUT_PRESETS;
  public shapes: string[] = ['auto', 'sphere', 'rounded-box', 'cube', 'capsule', 'cylinder',
    'cone', 'torus', 'prism', 'octahedron', 'lowpoly', 'panel', 'image-plane'];
  public preset = 'cognitive-tree';
  public failure = '';
  public selectedId = 0;
  public selectedTitle = '';
  public selectedShape = 'auto';
  public nodeCount = 0;
  public viz: any = { version: 1, preset: 'cognitive-tree', positions: {}, shapes: {}, locked: {} };
  private docs: any[] = [];
  private docIndex: any = {};
  private graphLoaded = false;
  private rebuildTimer: any;
  private sub: any;
  private saveTimer: any;
  private themeObserver: any;

  constructor(public scene: Scene3dService,
              private elementService: ElementService,
              private backend: BackendService,
              private ngZone: NgZone,
              private store: Store<CMStore>) {}

  public ngOnInit() {
    // deliberate diagnostic/test handle (works in production builds where
    // Angular's dev-mode ng.probe is unavailable)
    (window as any).__cm3d = this;
    // load persisted visualization state first (defaults if absent)
    const saved = this.backend.ipcRenderer.sendSync('loadViz3d', '1');
    if (saved && saved.version) {
      this.viz = saved;
      this.preset = saved.preset || this.preset;
    }
    this.ngZone.runOutsideAngular(() => {
      const ok = this.scene.init(this.host.nativeElement);
      if (!ok) {
        this.failure = this.scene.failureReason;
        return;
      }
      this.scene.onSelect = (id, additive) => this.ngZone.run(() => this.selectNode(id, additive));
      this.scene.onBackgroundClick = () => this.ngZone.run(() => this.clearSelection());
      this.scene.onDragEnd = (id, pos) => this.ngZone.run(() => this.persistPosition(id, pos));
      this.scene.onDoubleClick = (id) => this.ngZone.run(() => this.editNode(id));
    });
    if (!this.scene.available) { return; }
    // Load the ENTIRE map for 3D, independent of the 2D viewport. The 2D
    // canvas lazy-loads only a window around the scroll position into the
    // `cmes` store; driving the 3D scene from that store showed only the
    // handful of nodes near wherever the user happened to be scrolled.
    this.backend.ipcRenderer.on('loadedGraph3d', (event, all: any[]) => {
      this.ngZone.runOutsideAngular(() => this.buildScene(all || []));
    });
    this.backend.ipcRenderer.send('loadGraph3d', '1');
    // the 2D viewport store is now only a source of live edits: patch the
    // full set by id and rebuild, never replace it with the viewport subset
    this.sub = this.store.select('cmes').subscribe((docs: any[]) => {
      if (!this.graphLoaded || !docs || !docs.length) { return; }
      let changed = false;
      const byId = this.docIndex;
      for (const d of docs) {
        if (!d || typeof d.id !== 'number') { continue; }
        const prev = byId[d.id];
        if (!prev) { this.docs.push(d); byId[d.id] = d; changed = true; }
        else if (prev.coor && d.coor
          && (prev.coor.x !== d.coor.x || prev.coor.y !== d.coor.y
            || prev.title !== d.title || prev.cmobject !== d.cmobject)) {
          const i = this.docs.indexOf(prev);
          if (i !== -1) { this.docs[i] = d; }
          byId[d.id] = d; changed = true;
        }
      }
      if (changed) { this.scheduleRebuild(); }
    });
    // theme changes recolor the scene
    this.themeObserver = new MutationObserver(() => this.scene.applyTheme());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  public ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
    if (this.themeObserver) { this.themeObserver.disconnect(); }
    if (this.rebuildTimer) { clearTimeout(this.rebuildTimer); }
    this.saveViz(true);
    this.scene.dispose();
  }

  /** builds (or rebuilds) the whole scene from the full doc set */
  private buildScene(all: any[]) {
    this.docs = all;
    this.docIndex = {};
    for (const d of all) { if (d && typeof d.id === 'number') { this.docIndex[d.id] = d; } }
    this.nodeCount = all.filter((d) => d && d.id > 0).length;
    this.scene.setDocs(all, this.viz);
    this.graphLoaded = true;
    if (this.viz.camera) { this.scene.setCameraState(this.viz.camera); }
    else { this.scene.frameInitial(); }
  }

  /** coalesce live edits into a single rebuild (edits arrive in bursts) */
  private scheduleRebuild() {
    if (this.rebuildTimer) { clearTimeout(this.rebuildTimer); }
    this.rebuildTimer = setTimeout(() => {
      this.rebuildTimer = undefined;
      this.ngZone.runOutsideAngular(() => {
        this.nodeCount = this.docs.filter((d) => d && d.id > 0).length;
        this.scene.setDocs(this.docs, this.viz);
      });
    }, 400);
  }

  // ---- selection sync with the rest of the application ----

  public selectNode(id: number, additive: boolean) {
    this.selectedId = id;
    const doc = this.docs.filter((d) => d && d.id === id)[0];
    this.selectedTitle = doc ? doc.title : '';
    this.selectedShape = (this.viz.shapes && this.viz.shapes[id]) || 'auto';
    // the node may live outside the 2D viewport store (3D shows the whole
    // map); make sure it is loaded before selecting so editors/widgets work
    this.elementService.ensureLoaded(id);
    // drive the app-wide selection so editors/toolbars operate on it
    this.elementService.setSelectedCME(id);
    this.scene.setSelection([id]);
  }

  public clearSelection() {
    this.selectedId = 0;
    this.selectedTitle = '';
    this.scene.setSelection([]);
  }

  public editNode(id: number) {
    // double-click = select and let the user use the standard editors
    this.selectNode(id, false);
  }

  // ---- viz state persistence (debounced) ----

  public persistPosition(id: number, pos: any) {
    this.viz.positions[id] = { x: pos.x, y: pos.y, z: pos.z };
    this.saveViz();
  }

  public changePreset() {
    this.viz.preset = this.preset;
    this.ngZone.runOutsideAngular(() => {
      this.scene.setDocs(this.docs, this.viz);
      this.scene.frameAll();
    });
    this.saveViz();
  }

  public relayout() {
    // discard manual positions for the current view and recompute
    this.viz.positions = {};
    this.changePreset();
  }

  public changeShape() {
    if (!this.selectedId) { return; }
    if (this.selectedShape === 'auto') { delete this.viz.shapes[this.selectedId]; }
    else { this.viz.shapes[this.selectedId] = this.selectedShape; }
    this.ngZone.runOutsideAngular(() => this.scene.setDocs(this.docs, this.viz));
    this.scene.setSelection([this.selectedId]);
    this.saveViz();
  }

  public frameAll() { this.scene.frameAll(); }
  public focusSelected() { if (this.selectedId) { this.scene.focusNode(this.selectedId); } }

  public saveViz(immediate?: boolean) {
    this.viz.camera = this.scene.available ? this.scene.getCameraState() : this.viz.camera;
    if (this.saveTimer) { clearTimeout(this.saveTimer); }
    const doSave = () => this.backend.ipcRenderer.send('saveViz3d', this.viz);
    if (immediate) { doSave(); } else { this.saveTimer = setTimeout(doSave, 800); }
  }
}
