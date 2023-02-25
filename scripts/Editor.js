import { getElementStyle, applyEditingBehavior, setTitle } from "./app.js";
import { setPreviewSource, refreshPreview } from "./Workspace.js";

/**
 * @typedef EditorOptions
 * 
 * @property { string } [name]
 * @property { string } [value]
 * @property { boolean } [open]
 * @property { boolean } [autoCreated]
 * @property { boolean } [autoReplace]
*/

/**
 * @typedef EditorOpenOptions
 * 
 * @property { boolean } [autoCreated]
 * @property { boolean } [focusedOverride]
*/

/**
 * Creates a new Editor within the Workspace.
*/
export class Editor {
  #name;

  /**
   * @readonly
  */
  identifier = Math.random().toString();

  /**
   * @readonly
  */
  tab = document.createElement("button");

  /**
   * @readonly
  */
  editorName = document.createElement("span");

  /**
   * @readonly
  */
  editorClose = document.createElement("button");

  /**
   * @readonly
  */
  container = /** @type { NumTextElement } */ (document.createElement("num-text"));

  /**
   * @type { Option }
   * @readonly
  */
  previewOption = document.createElement("li");

  /**
   * @param { EditorOptions } options
  */
  constructor({ name = "Untitled.txt", value = "", open = true, autoCreated = false, autoReplace = true } = {}) {
    this.#name = (!name.includes(".")) ? `${name}.txt` : name;
    this.value = value;
    this.isOpen = open;
    this.autoCreated = autoCreated;
    this.autoReplace = autoReplace;

    /**
     * @type { boolean | undefined }
    */
    let focusedOverride;
    const changeIdentifier = Math.random().toString();
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);

    this.tab.classList.add("tab");
    this.tab.setAttribute("data-editor-identifier",this.identifier);
    if (value) this.tab.setAttribute("data-editor-refresh","");

    this.tab.addEventListener("mousedown",event => {
      if (document.activeElement === null) return;
      if (event.button !== 0 || document.activeElement.matches("[data-editor-rename]")) return;

      event.preventDefault();
      if (this.tab !== STE.query().tab){
        this.open();
      }
    });

    this.tab.addEventListener("keydown",event => {
      // This is where the accidental Enter key trapping for Editor renaming is being taken over.
      // Add a check to this to only apply this key handling if the Editor isn't currently being renamed in the Editor tab.
      if (event.key === " " || event.key === "Enter"){
        event.preventDefault();
        if (this.tab !== STE.query().tab){
          this.open();
        }
      }
    });

    this.tab.addEventListener("contextmenu",event => {
      if (event.target !== this.tab) return;

      let editorRename = /** @type { HTMLInputElement | null } */ (this.tab.querySelector("[data-editor-rename]"));
      if (editorRename === null){
        editorRename = document.createElement("input");
      } else {
        return editorRename.blur();
      }

      Object.assign(editorRename,{
        type: "text",
        placeholder: this.#name,
        tabIndex: -1,
        value: this.#name
      });
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
      applyEditingBehavior({ element: editorRename });

      editorRename.focus();
      editorRename.select();
    });

    this.tab.addEventListener("dragover",event => {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer !== null){
        event.dataTransfer.dropEffect = "copy";
      }
      if (this.tab !== STE.query().tab){
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

    this.container.classList.add("editor");
    this.container.setAttribute("data-editor-identifier",this.identifier);
    this.container.setAttribute("value",this.value);

    this.previewOption.part.add("option");
    this.previewOption.classList.add("option");
    this.previewOption.setAttribute("data-editor-identifier",this.identifier);
    this.previewOption.tabIndex = -1;
    this.previewOption.innerText = this.#name;

    this.tab.append(this.editorName,this.editorClose);
    workspace_tabs.insertBefore(this.tab,create_editor_button);
    workspace_editors.append(this.container);
    preview_menu.main.append(this.previewOption);

    applyEditingBehavior({ element: this.container });

    this.previewOption.addEventListener("click",() => {
      const { identifier } = this;
      setPreviewSource({ identifier });
    });

    this.container.editor.addEventListener("input",() => {
      if (this.tab.hasAttribute("data-editor-auto-created")){
        this.tab.removeAttribute("data-editor-auto-created");
      }
      if (!this.tab.hasAttribute("data-editor-refresh")){
        this.tab.setAttribute("data-editor-refresh","");
      }
      if (!this.tab.hasAttribute("data-editor-unsaved")){
        this.tab.setAttribute("data-editor-unsaved","");
      }
      refreshPreview();
    });

    if (STE.activeEditor !== null && STE.query().tab.hasAttribute("data-editor-auto-created")){
      if (document.activeElement === STE.query().container){
        focusedOverride = true;
      }
      if (autoReplace){
        this.close();
      } else {
        STE.query().tab.removeAttribute("data-editor-auto-created");
      }
    }

    if (open || STE.activeEditor === null){
      this.open({ autoCreated, focusedOverride });
    }

    this.container.syntaxLanguage = /** @type { string } */ (STE.query(this.identifier).getName("extension"));
    if ((STE.settings.get("syntax-highlighting") === true) && (this.container.syntaxLanguage in Prism.languages)){
      this.container.syntaxHighlight.enable();
    }
    
    setTimeout(() => {
      if (document.body.getAttribute("data-editor-change") === changeIdentifier){
        document.body.removeAttribute("data-editor-change");
      }
    },transitionDuration);
  }

  /**
   * @param { EditorOpenOptions } options
  */
  open({ autoCreated = false, focusedOverride = false } = {}) {
    const focused = (document.activeElement === STE.query().container) || focusedOverride;

    if (STE.query().tab){
      STE.query().tab.classList.remove("active");
    }
    if (STE.query().container){
      STE.query().container.classList.remove("active");
    }

    this.tab.classList.add("active");
    if (autoCreated){
      this.tab.setAttribute("data-editor-auto-created","");
    }
    this.container.classList.add("active");
    STE.activeEditor = this.identifier;

    setEditorTabsVisibility();
    setTitle({ content: this.#name });

    if ((((document.activeElement === document.body && STE.activeDialog !== null) || autoCreated) && !STE.environment.touchDevice && STE.appearance.parentWindow) || focused){
      this.container.focus({ preventScroll: true });
    }

    if (STE.previewEditor === "active-editor"){
      refreshPreview({ force: (STE.settings.get("automatic-refresh") !== false) });
    }
  }

  async close() {
    if (this.tab.hasAttribute("data-editor-unsaved")){
      if (!confirm(`Are you sure you would like to close "${this.#name}"?\nRecent changes have not yet been saved.`)) return;
    }

    const editorTabs = [...workspace_tabs.querySelectorAll(".tab:not([data-editor-change])")];
    const changeIdentifier = Math.random().toString();
    const focused = (document.activeElement === this.container);
    const transitionDuration = (document.body.hasAttribute("data-editor-change")) ? parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`) : 0;

    if (editorTabs.length !== 1){
      document.body.setAttribute("data-editor-change",changeIdentifier);
      this.tab.style.setProperty("--tab-margin-right",`-${this.tab.offsetWidth}px`);
    } else if (document.body.hasAttribute("data-editor-change")){
      document.body.removeAttribute("data-editor-change");
      workspace_tabs.querySelectorAll(".tab[data-editor-change]").forEach(tab => tab.remove());
    }

    if (this.tab === editorTabs[0] && editorTabs.length === 1){
      STE.activeEditor = null;
      setTitle({ reset: true });
      preview.src = "about:blank";
    }

    if (STE.previewEditor === this.identifier){
      setPreviewSource({ active_editor: true });
    }

    if (this.tab === editorTabs[0] && editorTabs[1] && this.tab.classList.contains("active")){
      const identifier = /** @type { string } */ (editorTabs[1].getAttribute("data-editor-identifier"));
      openEditor({ identifier });
    }
    if (this.tab === editorTabs[editorTabs.length - 1] && this.tab !== editorTabs[0] && this.tab.classList.contains("active")){
      const identifier = /** @type { string } */ (editorTabs[editorTabs.length - 2].getAttribute("data-editor-identifier"));
      openEditor({ identifier });
    }
    if (this.tab !== editorTabs[0] && this.tab.classList.contains("active")){
      const identifier = /** @type { string } */ (editorTabs[editorTabs.indexOf(this.tab) + 1].getAttribute("data-editor-identifier"));
      openEditor({ identifier });
    }

    if (focused && STE.query().textarea !== null){
      STE.query().container.focus({ preventScroll: true });
    }

    this.tab.setAttribute("data-editor-change","");
    if (this.tab === document.activeElement){
      this.tab.blur();
    }
    this.tab.tabIndex = -1;
    this.tab.classList.remove("active");

    workspace_editors.removeChild(this.container);
    preview_menu.main.removeChild(this.previewOption);

    if (STE.fileHandles[this.identifier]){
      delete STE.fileHandles[this.identifier];
    }

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

  get name() {
    return this.#name;
  }

  set name(rename) {
    const { getName } = STE.query(this.identifier);
    const currentName = this.#name;
    const base = getName("base");
    const extension = getName("extension");

    if (!rename.includes(".")){
      rename = `${rename}.${extension}`;
    } else if (rename.charAt(0) === "."){
      rename = `${base}${rename}`;
    }

    this.editorName.innerText = rename;
    this.previewOption.innerText = rename;

    const syntaxLanguage = /** @type { string } */ (STE.query(this.identifier).getName("extension"));
    const isLoadedLanguage = syntaxLanguage in Prism.languages;

    if (isLoadedLanguage){
      this.container.syntaxLanguage = syntaxLanguage;
    }
    if (STE.settings.get("syntax-highlighting") === true && isLoadedLanguage){
      this.container.syntaxHighlight.enable();
    } else {
      this.container.syntaxHighlight.disable();
    }
    if (syntaxLanguage !== this.container.syntaxLanguage){
      this.container.syntaxLanguage = syntaxLanguage;
    }

    if (this.tab.hasAttribute("data-editor-auto-created")){
      this.tab.removeAttribute("data-editor-auto-created");
    }

    if (this.tab === STE.query().tab){
      setTitle({ content: rename });
    }

    if ((STE.previewEditor === "active-editor" && STE.activeEditor === this.identifier) || STE.previewEditor === this.identifier){
      refreshPreview({ force: true });
    }
  }
}

globalThis.Editor = Editor;

/* Future feature: Add support to disable the wrapping behavior */
/**
 * Gets the previous Editor to the left of the currently opened Editor.
 * 
 * If the active Editor is the first one in the Workspace, it will wrap around to give the last Editor in the Workspace.
*/
export function getPreviousEditor({ identifier = STE.activeEditor, wrap = true } = {}){
  var { tab } = STE.query(identifier),
    editorTabs = Array.from(workspace_tabs.querySelectorAll(".tab:not([data-editor-change])")),
    previousTab = editorTabs[(editorTabs.indexOf(tab) || editorTabs.length) - 1],
    previousEditor = previousTab.getAttribute("data-editor-identifier");
  return previousEditor;
}

/**
 * Gets the next Editor to the right of the currently opened Editor.
 * 
 * If the active Editor is the last one in the Workspace, it will wrap around to give the first Editor in the Workspace.
*/
export function getNextEditor({ identifier = STE.activeEditor, wrap = true } = {}){
  var { tab } = STE.query(identifier),
    editorTabs = Array.from(workspace_tabs.querySelectorAll(".tab:not([data-editor-change])")),
    nextTab = editorTabs[(editorTabs.indexOf(tab) != editorTabs.length - 1) ? editorTabs.indexOf(tab) + 1 : 0],
    nextEditor = nextTab.getAttribute("data-editor-identifier");
  return nextEditor;
}

/**
 * Updates the horizontal scroll position of the Workspace Tabs section to show a given Editor, by it's given identifier.
 * 
 * If the given identifier is already fully in view, no scrolling will happen.
*/
export function setEditorTabsVisibility({ identifier = STE.activeEditor } = {}){
  if (!STE.activeEditor) return;
  var { tab } = STE.query(identifier), obstructedLeft = (tab.offsetLeft <= workspace_tabs.scrollLeft), obstructedRight = ((tab.offsetLeft + tab.clientWidth) >= (workspace_tabs.scrollLeft + workspace_tabs.clientWidth)), spacingOffset = 0;
  if ((workspace_tabs.clientWidth < tab.clientWidth) && !obstructedLeft) return;
  if (obstructedLeft){
    spacingOffset = parseInt(getElementStyle({ element: workspace_tabs, pseudo: "::before", property: "width" }),10) * 3;
    workspace_tabs.scrollTo(tab.offsetLeft - spacingOffset,0);
  } else if (obstructedRight){
    spacingOffset = parseInt(getElementStyle({ element: workspace_tabs, pseudo: "::after", property: "width" }),10) * 3;
    workspace_tabs.scrollTo(tab.offsetLeft + tab.clientWidth + spacingOffset - workspace_tabs.clientWidth,0);
  }
}