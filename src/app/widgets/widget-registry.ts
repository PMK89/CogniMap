/**
 * Widget/plugin registry — the single source of truth for the widgets that
 * can be docked into the two widget slots (widget0 / widget1).
 *
 * Each definition describes:
 *  - id: the persisted identifier (stored in CMSettings.widget0/widget1 —
 *    values must stay stable for data compatibility)
 *  - label / icon: presentation in the widget switcher
 *  - kind: 'component' (Angular component), 'iframe' (sandboxed HTML plugin)
 *    or 'none'
 *  - selector / iframeSrc: how the widget is instantiated
 *  - requiredAssets: static assets the plugin needs at runtime (served by
 *    the backend from src/assets — iframes lazy-load them on first open)
 *  - stateInputs: which parts of app state the widget consumes
 *  - outputEvents: how the widget's results flow back into the app
 *  - persistence: where the widget's own state is persisted, if anywhere
 */

export type WidgetKind = 'component' | 'iframe' | 'none';

export interface WidgetDefinition {
  id: string;
  label: string;
  icon: string;
  kind: WidgetKind;
  selector?: string;
  iframeSrc?: string;
  requiredAssets: string[];
  stateInputs: string[];
  outputEvents: string[];
  persistence: string;
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: 'none',
    label: 'None',
    icon: '○',
    kind: 'none',
    requiredAssets: [],
    stateInputs: [],
    outputEvents: [],
    persistence: 'none',
  },
  {
    id: 'equation',
    label: 'LaTeX Editor',
    icon: '∑',
    kind: 'component',
    selector: 'app-mjeditor',
    requiredAssets: [],
    stateInputs: ['selectedcmeo', 'settings'],
    outputEvents: ['content update via MjEditorService.saveLateX -> ElementService'],
    persistence: 'element content[] (cat: LateX) in cme.db via backend',
  },
  {
    id: 'formula',
    label: 'Chemical Formula (JSME)',
    icon: '⌬',
    kind: 'iframe',
    iframeSrc: 'assets/widgets/JSME/JSME_editor_plus_SVG.html',
    requiredAssets: ['assets/widgets/JSME/jsme/'],
    stateInputs: ['#structure (SMILES string, set via WidgetIframeAdapter)'],
    outputEvents: ['#svg_textarea JSON {type: jsme-svg, object, info} -> copy & paste flow'],
    persistence: 'element content[] (cat: jsme-svg) in cme.db via paste',
  },
  {
    id: 'svg',
    label: 'Vector Editor (SVG-Edit)',
    icon: '✎',
    kind: 'iframe',
    iframeSrc: 'assets/widgets/svgeditor/svg-editor.html',
    requiredAssets: ['assets/widgets/svgeditor/'],
    stateInputs: ['#cminput (SVG string, set via WidgetIframeAdapter)'],
    outputEvents: ['#svg_textarea JSON {type: svg, object, info} -> copy & paste flow'],
    persistence: 'element content[] (cat: svg) in cme.db via paste',
  },
  {
    id: 'navigator',
    label: 'Navigator',
    icon: '🧭',
    kind: 'component',
    selector: 'app-navigator',
    requiredAssets: ['assets/pdf/', 'assets/videos/', 'assets/txt/'],
    stateInputs: ['selectedcmeo', 'cmes', 'settings'],
    outputEvents: ['element edits via NavigatorService.changeCME'],
    persistence: 'element meta[]/links[] in cme.db via backend',
  },
  {
    id: 'minimap',
    label: 'Minimap',
    icon: '🗺',
    kind: 'component',
    selector: 'app-minimap',
    requiredAssets: [],
    stateInputs: ['settings', 'changedCME/deletedCME/changedSince backend events'],
    outputEvents: ['viewport scroll, saveMM on destroy'],
    persistence: 'data/minimap.json via backend',
  },
  {
    id: 'mnemo',
    label: 'Mnemonics',
    icon: '🧠',
    kind: 'component',
    selector: 'app-mnemo',
    requiredAssets: ['assets/images/mnemo/'],
    stateInputs: ['selectedcmeo', 'settings'],
    outputEvents: ['element content/style edits via MnemoService.changeCME'],
    persistence: 'element content[]/style in cme.db via backend',
  },
  {
    id: 'codeeditor',
    label: 'Code Editor',
    icon: '{ }',
    kind: 'component',
    selector: 'app-codeeditor',
    requiredAssets: ['assets/codemirror.js', 'assets/codemirror.css'],
    stateInputs: ['selectedcmeo'],
    outputEvents: ['content update via CodeeditorService.processCode'],
    persistence: 'element content[] (cat: html) in cme.db via backend',
  },
];

/** Widget ids in switcher order — same set the legacy dropdown offered. */
export const WIDGET_IDS: string[] = WIDGET_REGISTRY.map((w) => w.id);

export function getWidget(id: string): WidgetDefinition {
  const found = WIDGET_REGISTRY.filter((w) => w.id === id)[0];
  return found || WIDGET_REGISTRY[0];
}
