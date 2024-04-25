import STE from "./STE.js";
import { setPreviewSource, refreshPreview } from "./Workspace.js";
import { getElementStyle, applyEditingBehavior, setTitle } from "./dom.js";

export interface EditorOptions {
  name?: string;
  value?: string;
  handle?: FileSystemFileHandle;
  open?: boolean;
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
export class Editor extends NumTextElement {
  static #editors: { [identifier: string]: Editor; } = {};

  /**
   * Queries an Editor by it's identifier.
  */
  static query(identifier: string): Editor | null {
    return this.#editors[identifier] ?? null;
  }

  /**
   * Updates the horizontal scroll position of the Workspace Tabs section to show a given Editor, by it's given identifier.
   * 
   * If the given identifier is already fully in view, no scrolling will happen.
  */
  static setTabsVisibility(identifier: string | undefined = STE.activeEditor?.identifier): void {
    if (!identifier) return;
    const editor = this.query(identifier);
    if (editor === null) return;
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

  #name: string;

  readonly identifier = Math.random().toString();

  readonly tab = document.createElement("button");

  readonly editorName = document.createElement("span");

  readonly editorClose = document.createElement("button");

  readonly previewOption: MenuDropOption = document.createElement("li");

  declare handle: FileSystemFileHandle | null;
  declare readonly isOpen;

  get autoCreated(): boolean {
    return this.tab.hasAttribute("data-editor-auto-created");
  }

  set autoCreated(value) {
    if (value){
      this.tab.setAttribute("data-editor-auto-created","");
    } else {
      this.tab.removeAttribute("data-editor-auto-created");
    }
  }

  get refresh(): boolean {
    return this.tab.hasAttribute("data-editor-refresh");
  }

  set refresh(value) {
    if (value){
      this.tab.setAttribute("data-editor-refresh","");
    } else {
      this.tab.removeAttribute("data-editor-refresh");
    }
  }

  get unsaved(): boolean {
    return this.tab.hasAttribute("data-editor-unsaved");
  }

  set unsaved(value) {
    if (value){
      this.tab.setAttribute("data-editor-unsaved","");
    } else {
      this.tab.removeAttribute("data-editor-unsaved");
    }
  }

  declare readonly autoReplace;

  constructor({ name = "Untitled.txt", value = "", handle, open = true, autoCreated = false, autoReplace = true }: EditorOptions = {}) {
    super();

    this.#name = (!name.includes(".")) ? `${name}.txt` : name;
    this.editor.value = value;
    this.isOpen = open;
    this.autoCreated = autoCreated;
    this.autoReplace = autoReplace;

    let focusedOverride: boolean | undefined;
    const changeIdentifier = Math.random().toString();

    document.body.setAttribute("data-editor-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);

    this.tab.classList.add("tab");
    this.tab.setAttribute("data-editor-identifier",this.identifier);
    if (value) this.refresh = true;

    this.tab.addEventListener("mousedown",event => {
      if (document.activeElement === null) return;
      if (event.button !== 0 || document.activeElement.matches("[data-editor-rename]")) return;

      event.preventDefault();
      if (this.tab !== STE.activeEditor?.tab){
        this.open();
      }
    });

    this.tab.addEventListener("keydown",event => {
      // This is where the accidental Enter key trapping for Editor renaming is being taken over.
      // Add a check to this to only apply this key handling if the Editor isn't currently being renamed in the Editor tab.
      if (event.key === " " || event.key === "Enter"){
        event.preventDefault();
        if (this.tab !== STE.activeEditor?.tab){
          this.open();
        }
      }
    });

    this.tab.addEventListener("contextmenu",event => {
      if (event.target !== this.tab) return;

      let editorRename = this.tab.querySelector<HTMLInputElement>("[data-editor-rename]");
      if (editorRename === null){
        editorRename = document.createElement("input");
      } else {
        return editorRename.blur();
      }

      editorRename.type = "text";
      editorRename.placeholder = this.#name;
      editorRename.tabIndex = -1;
      editorRename.value = this.#name;
      editorRename.setAttribute("data-editor-rename","");
      editorRename.style.setProperty("--editor-name-width",`${this.editorName.offsetWidth}px`);

      editorRename.addEventListener("keydown",event => {
        if (editorRename === null) return;
        if (event.key === "Escape"){
          editorRename.blur();
        }
      });

      editorRename.addEventListener("input",() => {
        if (editorRename === null) return;
        editorRename.style.width = "0px";
        editorRename.offsetWidth;
        editorRename.style.setProperty("--editor-rename-width",`${editorRename.scrollWidth + 1}px`);
        editorRename.style.removeProperty("width");
      });

      editorRename.addEventListener("change",() => {
        if (editorRename === null) return;
        const { value: name } = editorRename;
        if (editorRename.value){
          this.name = name;
        }
        editorRename.blur();
      });

      editorRename.addEventListener("blur",() => {
        if (editorRename === null) return;
        editorRename.remove();
      });

      this.tab.insertBefore(editorRename,this.tab.firstChild);
      applyEditingBehavior(editorRename);

      editorRename.focus();
      editorRename.select();
    });

    this.tab.addEventListener("dragover",event => {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer !== null){
        event.dataTransfer.dropEffect = "copy";
      }
      if (this.tab !== STE.activeEditor?.tab){
        this.open();
      }
    });

    this.editorName.setAttribute("data-editor-name",this.#name);
    this.editorName.innerText = this.#name;

    this.editorClose.classList.add("option");
    this.editorClose.tabIndex = -1;
    this.editorClose.innerHTML = "<svg><use href='#close_icon'/></svg>";

    this.editorClose.addEventListener("mousedown",event => {
      event.preventDefault();
      event.stopPropagation();
    });

    this.editorClose.addEventListener("click",async event => {
      event.stopPropagation();
      await this.close();
    });

    this.classList.add("editor");
    this.setAttribute("data-editor-identifier",this.identifier);
    this.setAttribute("value",this.value);

    this.previewOption.part.add("option");
    this.previewOption.classList.add("option");
    this.previewOption.setAttribute("data-editor-identifier",this.identifier);
    this.previewOption.tabIndex = -1;
    this.previewOption.innerText = this.#name;

    this.previewOption.addEventListener("click",() => {
      setPreviewSource(this);
    });

    if (STE.activeEditor !== null && STE.activeEditor.autoCreated){
      if (document.activeElement === STE.activeEditor){
        focusedOverride = true;
      }
      if (autoReplace){
        STE.activeEditor.close();
      } else {
        STE.activeEditor.autoCreated = false;
      }
    }

    this.tab.append(this.editorName,this.editorClose);
    workspace_tabs.insertBefore(this.tab,create_editor_button);
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

    preview_menu.main.append(this.previewOption);

    applyEditingBehavior(this);
    Editor.#editors[this.identifier] = this;
    this.handle = handle ?? null;

    if (open || STE.activeEditor === null){
      this.open({ autoCreated, focusedOverride });
    }

    this.syntaxLanguage = this.extension;
    if ((STE.settings.syntaxHighlighting === true) && (this.syntaxLanguage in Prism.languages)){
      this.syntaxHighlight.enable();
    }

    setTimeout(() => {
      if (document.body.getAttribute("data-editor-change") === changeIdentifier){
        document.body.removeAttribute("data-editor-change");
      }
    },transitionDuration);
  }

  /**
   * Opens the editor in the workspace.
  */
  open({ autoCreated = false, focusedOverride = false }: EditorOpenOptions = {}): void {
    const focused = (document.activeElement === STE.activeEditor) || focusedOverride;

    STE.activeEditor?.tab.classList.remove("active");
    STE.activeEditor?.classList.remove("active");

    this.tab.classList.add("active");
    if (autoCreated){
      this.autoCreated = true;
    }
    this.classList.add("active");
    STE.activeEditor = this;

    Editor.setTabsVisibility();
    setTitle({ content: this.#name });

    if ((((document.activeElement === document.body && STE.activeDialog !== null) || autoCreated) && !STE.environment.touchDevice && STE.appearance.parentWindow) || focused){
      this.focus({ preventScroll: true });
    }

    if (STE.previewEditor === null){
      refreshPreview({ force: STE.settings.automaticRefresh !== false });
    }
  }

  /**
   * Closes the editor in the workspace.
  */
  async close(): Promise<void> {
    if (this.unsaved){
      const confirmation: boolean = confirm(`Are you sure you would like to close "${this.#name}"?\nRecent changes have not yet been saved.`);
      if (!confirmation) return;
    }

    const editorTabs = [...workspace_tabs.querySelectorAll<HTMLButtonElement>(".tab:not([data-editor-change])")];
    const changeIdentifier: string = Math.random().toString();
    const focused: boolean = document.activeElement === this;

    if (editorTabs.length !== 1){
      document.body.setAttribute("data-editor-change",changeIdentifier);
      this.tab.style.setProperty("--tab-margin-right",`-${this.tab.offsetWidth}px`);
    } else if (document.body.hasAttribute("data-editor-change")){
      document.body.removeAttribute("data-editor-change");
      for (const tab of workspace_tabs.querySelectorAll(".tab[data-editor-change]")){
        tab.remove();
      }
    }

    const transitionDuration = (document.body.hasAttribute("data-editor-change")) ? parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`) : 0;

    if (this.tab === editorTabs[0] && editorTabs.length === 1){
      STE.activeEditor = null;
      setTitle({ reset: true });
      preview.src = "about:blank";
    }

    if (STE.previewEditor === this){
      setPreviewSource(null);
    }

    if (this.tab === editorTabs[0] && editorTabs[1] && this.tab.classList.contains("active")){
      const identifier = editorTabs[1].getAttribute("data-editor-identifier")!;
      Editor.query(identifier)?.open();
    }
    if (this.tab === editorTabs[editorTabs.length - 1] && this.tab !== editorTabs[0] && this.tab.classList.contains("active")){
      const identifier = editorTabs[editorTabs.length - 2]!.getAttribute("data-editor-identifier")!;
      Editor.query(identifier)?.open();
    }
    if (this.tab !== editorTabs[0] && this.tab.classList.contains("active")){
      const identifier = editorTabs[editorTabs.indexOf(this.tab) + 1]!.getAttribute("data-editor-identifier")!;
      Editor.query(identifier)?.open();
    }

    if (focused && STE.activeEditor?.editor !== undefined){
      STE.activeEditor?.focus({ preventScroll: true });
    }

    this.tab.setAttribute("data-editor-change","");
    if (this.tab === document.activeElement){
      this.tab.blur();
    }
    this.tab.tabIndex = -1;
    this.tab.classList.remove("active");

    workspace_editors.removeChild(this);
    preview_menu.main.removeChild(this.previewOption);

    delete Editor.#editors[this.identifier];

    if (transitionDuration !== 0){
      await new Promise(resolve => setTimeout(resolve,transitionDuration));
    }
    if (workspace_tabs.contains(this.tab)){
      workspace_tabs.removeChild(this.tab);
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
  rename(name?: string): void {
    const currentName = this.#name;

    if (name === undefined){
      const result = prompt(`Enter a new file name for "${currentName}".`,currentName);
      if (result === null) return;
      name = result;
    }

    this.name = name;
  }

  /**
   * Gets the previous Editor to the left of this Editor.
   * 
   * If this Editor is the first one in the Workspace, it will wrap around to give the last Editor in the Workspace.
   * 
   * @param wrap Future feature: Add support to toggle the wrapping behavior.
  */
  getPrevious(_wrap: boolean = true): Editor | null {
    const { tab } = this;
    const editorTabs: HTMLButtonElement[] = [...workspace_tabs.querySelectorAll<HTMLButtonElement>(".tab:not([data-editor-change])")];
    const previousTab: HTMLButtonElement | null = editorTabs[(editorTabs.indexOf(tab) || editorTabs.length) - 1] ?? null;
    const previousIdentifier: string | null = previousTab?.getAttribute("data-editor-identifier") ?? null;
    const previousEditor: Editor | null = previousIdentifier ? Editor.query(previousIdentifier) : null;
    return previousEditor;
  }

  /**
   * Gets the next Editor to the right of this Editor.
   * 
   * If this Editor is the last one in the Workspace, it will wrap around to give the first Editor in the Workspace.
   * 
   * @param wrap Future feature: Add support to toggle the wrapping behavior.
  */
  getNext(_wrap: boolean = true): Editor | null {
    const { tab } = this;
    const editorTabs: HTMLButtonElement[] = [...workspace_tabs.querySelectorAll<HTMLButtonElement>(".tab:not([data-editor-change])")];
    const nextTab: HTMLButtonElement | null = editorTabs[(editorTabs.indexOf(tab) !== editorTabs.length - 1) ? editorTabs.indexOf(tab) + 1 : 0] ?? null;
    const nextIdentifier: string | null = nextTab?.getAttribute("data-editor-identifier") ?? null;
    const nextEditor: Editor | null = nextIdentifier ? Editor.query(nextIdentifier) : null;
    return nextEditor;
  }

  get name(): string {
    return this.#name;
  }

  set name(rename) {
    const { basename, extension } = this;

    if (!rename.includes(".")){
      rename = `${rename}.${extension}`;
    } else if (rename.startsWith(".")){
      rename = `${basename}${rename}`;
    }

    this.editorName.innerText = rename;
    this.previewOption.innerText = rename;

    this.#name = rename;

    const syntaxLanguage: string = this.extension;
    const isLoadedLanguage: boolean = syntaxLanguage in Prism.languages;

    if (isLoadedLanguage){
      this.syntaxLanguage = syntaxLanguage;
    }
    if (STE.settings.syntaxHighlighting === true && isLoadedLanguage){
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

    if (this.tab === STE.activeEditor?.tab){
      setTitle({ content: rename });
    }

    if ((STE.previewEditor === null && STE.activeEditor === this) || STE.previewEditor === this){
      refreshPreview({ force: true });
    }
  }

  get basename(): string {
    const name = this.#name;
    if (!name.includes(".")) return name;
    const basename: string = name.split(".").slice(0,-1).join(".");
    return basename;
  }

  get extension(): string {
    const name = this.#name;
    if (!name.includes(".")) return "";
    const extension: string = name.split(".").pop()!;
    return extension;
  }
}

window.customElements.define("ste-editor",Editor);

declare global {
  interface HTMLElementTagNameMap {
    "ste-editor": Editor;
  }

  interface Window {
    Editor: typeof Editor;
  }
}

window.Editor = Editor;

export default Editor;