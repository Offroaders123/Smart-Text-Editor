import { createSignal, onMount } from "solid-js";
import Prism from "./prism.js";
import EditorTab from "./EditorTab.js";
import PreviewOption from "./PreviewOption.js";
import { activeEditor, settings, setActiveEditor, activeDialog, environment, appearance, previewEditor, preview as getPreview, workspaceEditors, workspaceTabs, createEditorButton, editors, setEditors, previewMenu } from "./STE.js";
import { setPreviewSource, refreshPreview } from "./Workspace.js";
import { getElementStyle, applyEditingBehavior, setTitle } from "./dom.js";
import "./Editor.scss";

import type { Accessor, Setter } from "solid-js";

export class Editor {
  readonly identifier: string = Math.random().toString();
  getName: Accessor<string>;
  setName: Setter<string>;
  getValue: Accessor<string>;
  setValue: Setter<string>;
  readonly tab: HTMLButtonElement;
  readonly previewOption: MenuDropOption;
  getHandle: Accessor<FileSystemFileHandle | null>;
  setHandle: Setter<FileSystemFileHandle | null>;
  readonly isOpen: boolean;
  getAutoCreated: Accessor<boolean>;
  setAutoCreated: Setter<boolean>;
  getFocusedOverride: Accessor<boolean>;
  setFocusedOverride: Setter<boolean>;
  getRefresh: Accessor<boolean>;
  setRefresh: Setter<boolean>;
  getUnsaved: Accessor<boolean>;
  setUnsaved: Setter<boolean>;
  readonly autoReplace: boolean;
  readonly ref!: NumTextElement;

  constructor({ name = "Untitled.txt", value = "", handle, isOpen = true, autoCreated = false, autoReplace = true }: EditorOptions = {}) {
    const { identifier } = this;
    const [getName, setName] = createSignal<string>(name);
    const [getValue, setValue] = createSignal<string>(value);
    const [getHandle, setHandle] = createSignal<FileSystemFileHandle | null>(handle ?? null);
    const [getAutoCreated, setAutoCreated] = createSignal<boolean>(autoCreated);
    const [getRefresh, setRefresh] = createSignal<boolean>(false);
    const [getUnsaved, setUnsaved] = createSignal<boolean>(false);
    const [getFocusedOverride, setFocusedOverride] = createSignal<boolean>(false);

    this.getName = getName;
    this.setName = setName;
    this.setName((!name.includes(".")) ? `${name}.txt` : name);
    this.getValue = getValue;
    this.setValue = setValue;
    this.setValue(value);
    this.getHandle = getHandle;
    this.setHandle = setHandle;
    this.isOpen = isOpen;
    this.getAutoCreated = getAutoCreated;
    this.setAutoCreated = setAutoCreated;
    this.getRefresh = getRefresh;
    this.setRefresh = setRefresh;
    this.getUnsaved = getUnsaved;
    this.setUnsaved = setUnsaved;
    this.autoReplace = autoReplace;
    this.getFocusedOverride = getFocusedOverride;
    this.setFocusedOverride = setFocusedOverride;

    if (value) this.setRefresh(true);

    // this.ref = ref;
    this.tab = EditorTab({ identifier, getName, setName: name => { this.setName(name); }, getAutoCreated, getRefresh, getUnsaved }) as HTMLButtonElement;
    this.previewOption = PreviewOption({ identifier, getName }) as MenuDropOption;
  }

  getBasename(): string {
    const name: string = this.getName();
    if (!name.includes(".")) return name;
    const basename: string = name.split(".").slice(0,-1).join(".");
    return basename;
  }

  getExtension(): string {
    const name: string = this.getName();
    if (!name.includes(".")) return "";
    const extension: string = name.split(".").pop()!;
    return extension;
  }
}

export interface EditorOptions {
  name?: string;
  value?: string;
  handle?: FileSystemFileHandle | null;
  isOpen?: boolean;
  autoCreated?: boolean;
  autoReplace?: boolean;
}

export interface EditorOpenOptions {
  autoCreated?: boolean;
  focusedOverride?: boolean;
}

/**
 * Creates a new Editor within the Workspace.
*/
export function createEditor(options: EditorOptions = {}): void {
  const state = new Editor(options);
  const editorElement = EditorElement(state);
  state.ref = editorElement;
  setEditors(state.identifier, state);

  const autoCreated = state.getAutoCreated();
  const focusedOverride = state.getFocusedOverride();
  if (state.isOpen || activeEditor() === null){
    open(state.identifier, { autoCreated, focusedOverride });
    state.setFocusedOverride(false);
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
    editor.setAutoCreated(true);
  }
  editor.ref.classList.add("active");
  setActiveEditor(editor.identifier);

  setTabsVisibility();
  setTitle({ content: editor.getName() });

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

  if (editor.getUnsaved()){
    const confirmation: boolean = confirm(`Are you sure you would like to close "${editor.getName()}"?\nRecent changes have not yet been saved.`);
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

  if (previewEditor() === editor.identifier){
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

  setEditors(editor.identifier, undefined);

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

  const currentName = editor.getName();

  if (name === undefined){
    const result = prompt(`Enter a new file name for "${currentName}".`,currentName);
    if (result === null) return;
    name = result;
  }

  editor.setName(name);
}

  /**
   * Queries an Editor by it's identifier.
  */
  export function query(identifier: string | null): Editor | null {
    if (typeof identifier !== "string") return null;
    const editor: Editor | null = editors[identifier] ?? null;
    if (editor === null) return null;
    return editor;
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

interface _EditorLegacy extends NumTextElement {
  self: Editor;
}

function EditorElement(self: Editor) {
  function _setValue(this: _EditorLegacy, value: string): void {
    this.self.setValue(value);
    // super.value = value;
  }

  let ref: NumTextElement;

  onMount(async () => {
    await new Promise<void>(queueMicrotask);

    const workspace_tabs: HTMLDivElement = workspaceTabs()!;
    const create_editor_button: HTMLButtonElement = createEditorButton()!;
    const workspace_editors: HTMLDivElement = workspaceEditors()!;

    // let focusedOverride: boolean | undefined;
    const changeIdentifier = Math.random().toString();

    document.body.setAttribute("data-editor-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);

    if (self.getValue()) self.setRefresh(true);

    ref.classList.add("Editor");
    ref.setAttribute("data-editor-identifier",self.identifier);
    ref.setAttribute("value",self.getValue());

    if (activeEditor() !== null && query(activeEditor()!)!.getAutoCreated()){
      if (document.activeElement === query(activeEditor()!)!.ref){
        self.setFocusedOverride(true);
      }
      if (self.autoReplace){
        close(activeEditor()!);
      } else {
        query(activeEditor()!)!.setAutoCreated(false);
      }
    }

    // this.tab.append(this.editorName,this.editorClose);
    workspace_tabs.insertBefore(self.tab,create_editor_button);
    workspace_editors.append(ref);

    ref.editor.addEventListener("input",() => {
      self.setValue(ref.editor.value);
      if (self.getAutoCreated()){
        self.setAutoCreated(false);
      }
      if (!self.getRefresh()){
        self.setRefresh(true);
      }
      if (!self.getUnsaved()){
        self.setUnsaved(true);
      }
      refreshPreview();
    });

    previewMenu()!.main.append(self.previewOption);

    applyEditingBehavior(ref);
    // setEditors(this.identifier, this);
    // this.handle = handle ?? null;

    // if (isOpen || activeEditor() === null){
    //   open(this, { autoCreated, focusedOverride });
    // }

    ref.syntaxLanguage = self.getExtension();
    if ((settings.syntaxHighlighting === true) && (ref.syntaxLanguage in Prism.languages)){
      ref.syntaxHighlight.enable();
    }

    setTimeout(() => {
      if (document.body.getAttribute("data-editor-change") === changeIdentifier){
        document.body.removeAttribute("data-editor-change");
      }
    },transitionDuration);
  });

  function _setName(this: _EditorLegacy, rename: string): void {
    const [ basename, extension ] = [this.self.getBasename(), this.self.getExtension()];
    console.log(basename, extension);

    if (!rename.includes(".")){
      rename = `${rename}.${extension}`;
    } else if (rename.startsWith(".")){
      rename = `${basename}${rename}`;
    }

    // this.editorName.innerText = rename;
    // this.previewOption.innerText = rename;

    this.self.setName(rename);

    const syntaxLanguage: string = this.self.getExtension();
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

    if (this.self.getAutoCreated()){
      this.self.setAutoCreated(false);
    }

    if (this.self.tab === query(activeEditor())?.tab){
      setTitle({ content: rename });
    }

    if ((previewEditor() === null && activeEditor() === this.self.identifier) || previewEditor() === this.self.identifier){
      refreshPreview({ force: true });
    }
  }

  return (
    <num-text
      ref={editor => ref = editor}
    />
  );
}