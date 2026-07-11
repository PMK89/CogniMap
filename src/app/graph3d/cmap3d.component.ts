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
  public preset = 'layered-depth';
  public failure = '';
  public selectedId = 0;
  public selectedTitle = '';
  public selectedShape = 'auto';
  public nodeCount = 0;
  public viz: any = { version: 1, preset: 'layered-depth', positions: {}, shapes: {}, locked: {} };
  private docs: any[] = [];
  private sub: any;
  private saveTimer: any;
  private themeObserver: any;

  constructor(public scene: Scene3dService,
              private elementService: ElementService,
              private backend: BackendService,
              private ngZone: NgZone,
              private store: Store<CMStore>) {}

  public ngOnInit() {
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
    this.sub = this.store.select('cmes').subscribe((docs: any[]) => {
      if (docs && docs.length) {
        this.docs = docs;
        this.nodeCount = docs.filter((d) => d && d.id > 0).length;
        this.ngZone.runOutsideAngular(() => {
          this.scene.setDocs(docs, this.viz);
          if (this.viz.camera) { this.scene.setCameraState(this.viz.camera); }
          else { this.scene.frameAll(); }
        });
      }
    });
    // theme changes recolor the scene
    this.themeObserver = new MutationObserver(() => this.scene.applyTheme());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  public ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
    if (this.themeObserver) { this.themeObserver.disconnect(); }
    this.saveViz(true);
    this.scene.dispose();
  }

  // ---- selection sync with the rest of the application ----

  public selectNode(id: number, additive: boolean) {
    this.selectedId = id;
    const doc = this.docs.filter((d) => d && d.id === id)[0];
    this.selectedTitle = doc ? doc.title : '';
    this.selectedShape = (this.viz.shapes && this.viz.shapes[id]) || 'auto';
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
