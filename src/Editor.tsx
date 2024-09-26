import { createSignal } from "solid-js";
import Prism from "./prism.js";
import EditorTab from "./EditorTab.js";
import { activeEditor, settings, setActiveEditor, activeDialog, environment, appearance, previewEditor, preview as getPreview, workspaceEditors, workspaceTabs, createEditorButton, editors, setEditors, previewMenu } from "./STE.js";
import { setPreviewSource, refreshPreview } from "./Workspace.js";
import { getElementStyle, applyEditingBehavior, setTitle } from "./dom.js";
import "./Editor.scss";

import type { Accessor, Setter } from "solid-js";

export interface Editor {
  readonly identifier: string;
  name: string;
  value: string;
  handle: FileSystemFileHandle | null;
  readonly isOpen: boolean;
  autoCreated: boolean;
  focusedOverride: boolean;
  refresh: boolean;
  unsaved: boolean;
  readonly autoReplace: boolean;
}

export interface EditorOptions extends Partial<Omit<Editor, "identifier" | "focusedOverride" | "refresh" | "unsaved">> {}

export interface EditorOpenOptions {
  autoCreated?: boolean;
  focusedOverride?: boolean;
}

/**
 * Creates a new Editor within the Workspace.
*/
export function createEditor(options: EditorOptions = {}): void {
  const editorElement = new EditorLegacy(options);
  setEditors(editorElement.identifier, editorElement);

  const { autoCreated, focusedOverride } = editorElement;
  if (editorElement.isOpen || activeEditor() === null){
    open(editorElement.identifier, { autoCreated, focusedOverride });
    editorElement.focusedOverride = false;
  }
}

/**
 * Gets the previous Editor to the left of this Editor.
 * 
 * If this Editor is the first one in the Workspace, it will wrap around to give the last Editor in the Workspace.
 * 
 * @param wrap Future feature: Add support to toggle the wrapping behavior.
*/
export function getPrevious(identifier: string | null, _wrap: boolean = true): string | null {
  const editor = query(identifier);
  if (editor === null) return null;
  const workspace_tabs: HTMLDivElement = workspaceTabs()!;
  const { tab } = editor;
  const editorTabs: HTMLButtonElement[] = [...workspace_tabs.querySelectorAll<HTMLButtonElement>(".tab:not([data-editor-change])")];
  const previousTab: HTMLButtonElement | null = editorTabs[(editorTabs.indexOf(tab) || editorTabs.length) - 1] ?? null;
  const previousIdentifier: string | null = previousTab?.getAttribute("data-editor-identifier") ?? null;
  return previousIdentifier;
}

/**
 * Gets the next Editor to the right of this Editor.
 * 
 * If this Editor is the last one in the Workspace, it will wrap around to give the first Editor in the Workspace.
 * 
 * @param wrap Future feature: Add support to toggle the wrapping behavior.
*/
export function getNext(identifier: string | null, _wrap: boolean = true): string | null {
  const editor = query(identifier);
  if (editor === null) return null;
  const workspace_tabs: HTMLDivElement = workspaceTabs()!;
  const { tab } = editor;
  const editorTabs: HTMLButtonElement[] = [...workspace_tabs.querySelectorAll<HTMLButtonElement>(".tab:not([data-editor-change])")];
  const nextTab: HTMLButtonElement | null = editorTabs[(editorTabs.indexOf(tab) !== editorTabs.length - 1) ? editorTabs.indexOf(tab) + 1 : 0] ?? null;
  const nextIdentifier: string | null = nextTab?.getAttribute("data-editor-identifier") ?? null;
  return nextIdentifier;
}

/**
 * Opens the editor in the workspace.
*/
export function open(identifier: string | null, { autoCreated = false, focusedOverride = false }: EditorOpenOptions = {}): void {
  const editor = query(identifier);
  if (editor === null) return;

  const focused = (document.activeElement === activeEditor()) || focusedOverride;

  query(activeEditor())?.tab.classList.remove("active");
  query(activeEditor())?.ref.classList.remove("active");

  editor.tab.classList.add("active");
  if (autoCreated){
    editor.state.autoCreated = true;
  }
  editor.ref.classList.add("active");
  setActiveEditor(editor.state.identifier);

  setTabsVisibility();
  setTitle({ content: editor.state.name });

  if ((((document.activeElement === document.body && activeDialog() !== null) || autoCreated) && !environment.touchDevice && appearance.parentWindow) || focused){
    editor.ref.focus({ preventScroll: true });
  }

  if (previewEditor() === null){
    refreshPreview({ force: settings.automaticRefresh !== false });
  }
}

/**
 * Closes the editor in the workspace.
*/
export async function close(identifier: string | null): Promise<void> {
  const editor = query(identifier);
  if (editor === null) return;

  if (editor.state.unsaved){
    const confirmation: boolean = confirm(`Are you sure you would like to close "${editor.state.name}"?\nRecent changes have not yet been saved.`);
    if (!confirmation) return;
  }

  const workspace_tabs: HTMLDivElement = workspaceTabs()!;
  const workspace_editors: HTMLDivElement = workspaceEditors()!;
  const preview: HTMLIFrameElement = getPreview()!;
  const editorTabs = [...workspace_tabs.querySelectorAll<HTMLButtonElement>(".tab:not([data-editor-change])")];
  const changeIdentifier: string = Math.random().toString();
  const focused: boolean = document.activeElement === editor.ref;

  if (editorTabs.length !== 1){
    document.body.setAttribute("data-editor-change",changeIdentifier);
    editor.tab.style.setProperty("--tab-margin-right",`-${editor.tab.offsetWidth}px`);
  } else if (document.body.hasAttribute("data-editor-change")){
    document.body.removeAttribute("data-editor-change");
    for (const tab of workspace_tabs.querySelectorAll(".tab[data-editor-change]")){
      tab.remove();
    }
  }

  const transitionDuration = (document.body.hasAttribute("data-editor-change")) ? parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`) : 0;

  if (editor.tab === editorTabs[0] && editorTabs.length === 1){
    setActiveEditor(null);
    setTitle({ reset: true });
    preview.src = "about:blank";
  }

  if (previewEditor() === editor.state.identifier){
    setPreviewSource(null);
  }

  if (editor.tab === editorTabs[0] && editorTabs[1] && editor.tab.classList.contains("active")){
    const identifier = editorTabs[1].getAttribute("data-editor-identifier")!;
    open(identifier);
  }
  if (editor.tab === editorTabs[editorTabs.length - 1] && editor.tab !== editorTabs[0] && editor.tab.classList.contains("active")){
    const identifier = editorTabs[editorTabs.length - 2]!.getAttribute("data-editor-identifier")!;
    open(identifier);
  }
  if (editor.tab !== editorTabs[0] && editor.tab.classList.contains("active")){
    const identifier = editorTabs[editorTabs.indexOf(editor.tab) + 1]!.getAttribute("data-editor-identifier")!;
    open(identifier);
  }

  if (focused && query(activeEditor())?.ref.editor !== undefined){
    query(activeEditor())?.ref.focus({ preventScroll: true });
  }

  editor.tab.setAttribute("data-editor-change","");
  if (editor.tab === document.activeElement){
    editor.tab.blur();
  }
  editor.tab.tabIndex = -1;
  editor.tab.classList.remove("active");

  workspace_editors.removeChild(editor.ref);
  previewMenu()!.main.removeChild(editor.previewOption);

  setEditors(editor.state.identifier, undefined);

  if (transitionDuration !== 0){
    await new Promise(resolve => setTimeout(resolve,transitionDuration));
  }
  if (workspace_tabs.contains(editor.tab)){
    workspace_tabs.removeChild(editor.tab);
  }
  if (document.body.getAttribute("data-editor-change") === changeIdentifier){
    document.body.removeAttribute("data-editor-change");
  }
}

/**
 * Renames the file of the editor.
 * 
 * @param name If a new name isn't provided, the user is prompted to provide one.
*/
export function rename(identifier: string | null, name?: string): void {
  const editor = query(identifier);
  if (editor === null) return;

  const currentName = editor.state.name;

  if (name === undefined){
    const result = prompt(`Enter a new file name for "${currentName}".`,currentName);
    if (result === null) return;
    name = result;
  }

  editor.state.name = name;
}

export interface EditorElement {
  readonly ref: NumTextElement;
  readonly tab: HTMLButtonElement;
  readonly previewOption: MenuDropOption;
  readonly basename: string;
  readonly extension: string;
  readonly state: Editor;
}

  /**
   * Queries an Editor by it's identifier.
  */
  export function query(identifier: string | null): EditorElement | null {
    if (typeof identifier !== "string") return null;
    const editor: Editor | null = editors[identifier] ?? null;
    if (editor === null) return null;
    const ref = document.querySelector<EditorLegacy>(`.Editor[data-editor-identifier="${editor.identifier}"]`);
    if (ref === null) return null;
    const { tab, previewOption } = ref;
    const basename = getBasename(ref.name);
    const extension = getExtension(ref.name);
    return { ref: ref satisfies NumTextElement, tab, previewOption, basename, extension, state: ref satisfies Editor }; // `['state']` ideally will be the `editor` value instead.
  }

  /**
   * Updates the horizontal scroll position of the Workspace Tabs section to show a given Editor, by it's given identifier.
   * 
   * If the given identifier is already fully in view, no scrolling will happen.
  */
  export function setTabsVisibility(identifier: string | null = activeEditor()): void {
    if (!identifier) return;
    const editor = query(identifier);
    if (editor === null) return;
    const workspace_tabs: HTMLDivElement = workspaceTabs()!;
    const { tab } = editor;
    const obstructedLeft: boolean = (tab.offsetLeft <= workspace_tabs.scrollLeft);
    const obstructedRight: boolean = ((tab.offsetLeft + tab.clientWidth) >= (workspace_tabs.scrollLeft + workspace_tabs.clientWidth));
    let spacingOffset = 0;
    if ((workspace_tabs.clientWidth < tab.clientWidth) && !obstructedLeft) return;
    if (obstructedLeft){
      spacingOffset = parseInt(getElementStyle({ element: workspace_tabs, pseudo: "::before", property: "width" }),10) * 3;
      workspace_tabs.scrollTo(tab.offsetLeft - spacingOffset,0);
    } else if (obstructedRight){
      spacingOffset = parseInt(getElementStyle({ element: workspace_tabs, pseudo: "::after", property: "width" }),10) * 3;
      workspace_tabs.scrollTo(tab.offsetLeft + tab.clientWidth + spacingOffset - workspace_tabs.clientWidth,0);
    }
  }

class EditorLegacy extends NumTextElement implements Editor {
  // #name: string;

  private getName: Accessor<string>;

  private setName: Setter<string>;

  readonly identifier = Math.random().toString();

  get tab(): HTMLButtonElement {
    return workspaceTabs()?.querySelector(`.tab[data-editor-identifier="${this.identifier}"]`)!;
  }

  readonly previewOption: MenuDropOption = document.createElement("li");

  declare handle: FileSystemFileHandle | null;
  declare readonly isOpen;

  private getAutoCreated: Accessor<boolean>;

  private setAutoCreated: Setter<boolean>;

  get autoCreated(): boolean {
    return this.getAutoCreated();
  }

  private set autoCreated(value) {
    this.setAutoCreated(value);
  }

  private getRefresh: Accessor<boolean>;

  private setRefresh: Setter<boolean>;

  get refresh(): boolean {
    return this.getRefresh();
  }

  private set refresh(value) {
    this.setRefresh(value);
  }

  private getUnsaved: Accessor<boolean>;

  private setUnsaved: Setter<boolean>;

  get unsaved(): boolean {
    return this.getUnsaved();
  }

  private set unsaved(value) {
    this.setUnsaved(value);
  }

  declare readonly autoReplace;

  focusedOverride: boolean = false;

  constructor({ name = "Untitled.txt", value = "", handle, isOpen = true, autoCreated = false, autoReplace = true }: EditorOptions = {}) {
    super();
    const workspace_tabs: HTMLDivElement = workspaceTabs()!;
    const create_editor_button: HTMLButtonElement = createEditorButton()!;
    const workspace_editors: HTMLDivElement = workspaceEditors()!;

    const { identifier } = this;
    const [getName, setName] = createSignal(name);
    const [getAutoCreated, setAutoCreated] = createSignal<boolean>(autoCreated);
    const [getRefresh, setRefresh] = createSignal<boolean>(false);
    const [getUnsaved, setUnsaved] = createSignal<boolean>(false);

    this.getName = getName;
    this.setName = setName;
    this.setName((!name.includes(".")) ? `${name}.txt` : name);
    this.editor.value = value;
    this.isOpen = isOpen;
    this.getAutoCreated = getAutoCreated;
    this.setAutoCreated = setAutoCreated;
    this.getRefresh = getRefresh;
    this.setRefresh = setRefresh;
    this.getUnsaved = getUnsaved;
    this.setUnsaved = setUnsaved;
    this.autoReplace = autoReplace;

    // let focusedOverride: boolean | undefined;
    const changeIdentifier = Math.random().toString();

    document.body.setAttribute("data-editor-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);

    if (value) this.setRefresh(true);

    this.classList.add("Editor");
    this.setAttribute("data-editor-identifier",this.identifier);
    this.setAttribute("value",this.value);

    this.previewOption.part.add("option");
    this.previewOption.classList.add("option");
    this.previewOption.setAttribute("data-editor-identifier",this.identifier);
    this.previewOption.tabIndex = -1;
    this.previewOption.innerText = this.getName();

    this.previewOption.addEventListener("click",() => {
      setPreviewSource(this.identifier);
    });

    if (activeEditor() !== null && query(activeEditor()!)!.state.autoCreated){
      if (document.activeElement === query(activeEditor()!)!.ref){
        this.focusedOverride = true;
      }
      if (autoReplace){
        close(activeEditor()!);
      } else {
        query(activeEditor()!)!.state.autoCreated = false;
      }
    }

    // this.tab.append(this.editorName,this.editorClose);
    workspace_tabs.insertBefore(EditorTab({ identifier, getName, setName, getAutoCreated, getRefresh, getUnsaved }) as Element,create_editor_button);
    workspace_editors.append(this);

    this.editor.addEventListener("input",() => {
      if (this.autoCreated){
        this.autoCreated = false;
      }
      if (!this.refresh){
        this.refresh = true;
      }
      if (!this.unsaved){
        this.unsaved = true;
      }
      refreshPreview();
    });

    previewMenu()!.main.append(this.previewOption);

    applyEditingBehavior(this);
    // setEditors(this.identifier, this);
    this.handle = handle ?? null;

    // if (isOpen || activeEditor() === null){
    //   open(this, { autoCreated, focusedOverride });
    // }

    this.syntaxLanguage = getExtension(this.getName());
    if ((settings.syntaxHighlighting === true) && (this.syntaxLanguage in Prism.languages)){
      this.syntaxHighlight.enable();
    }

    setTimeout(() => {
      if (document.body.getAttribute("data-editor-change") === changeIdentifier){
        document.body.removeAttribute("data-editor-change");
      }
    },transitionDuration);
  }

  get name(): string {
    return this.getName();
  }

  private set name(rename) {
    const [ basename, extension ] = [getBasename(this.getName()), getExtension(this.getName())];
    console.log(basename, extension);

    if (!rename.includes(".")){
      rename = `${rename}.${extension}`;
    } else if (rename.startsWith(".")){
      rename = `${basename}${rename}`;
    }

    // this.editorName.innerText = rename;
    this.previewOption.innerText = rename;

    this.setName(rename);

    const syntaxLanguage: string = getExtension(this.getName());
    const isLoadedLanguage: boolean = syntaxLanguage in Prism.languages;

    if (isLoadedLanguage){
      this.syntaxLanguage = syntaxLanguage;
    }
    if (settings.syntaxHighlighting === true && isLoadedLanguage){
      this.syntaxHighlight.enable();
    } else {
      this.syntaxHighlight.disable();
    }
    if (syntaxLanguage !== this.syntaxLanguage){
      this.syntaxLanguage = syntaxLanguage;
    }

    if (this.autoCreated){
      this.autoCreated = false;
    }

    if (this.tab === query(activeEditor())?.tab){
      setTitle({ content: rename });
    }

    if ((previewEditor() === null && activeEditor() === this.identifier) || previewEditor() === this.identifier){
      refreshPreview({ force: true });
    }
  }
}

  function getBasename(name: string): string {
    if (!name.includes(".")) return name;
    const basename: string = name.split(".").slice(0,-1).join(".");
    return basename;
  }

  function getExtension(name: string): string {
    if (!name.includes(".")) return "";
    const extension: string = name.split(".").pop()!;
    return extension;
  }

window.customElements.define("ste-editor",EditorLegacy);

declare global {
  interface HTMLElementTagNameMap {
    "ste-editor": EditorLegacy;
  }
}