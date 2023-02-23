import { getElementStyle, applyEditingBehavior, setTitle } from "./app.js";

globalThis.createEditor = createEditor;
globalThis.renameEditor = renameEditor;

/**
 * Creates a new Editor within the Workspace.
 * 
 * @returns The identifier for the given Editor.
*/
export function createEditor({ name = "Untitled.txt", value = "", open = true, auto_created = false, auto_replace = true } = {}){
  let identifier = Math.random().toString(),
    tab = document.createElement("button"),
    editorName = document.createElement("span"),
    editorClose = document.createElement("button"),
    container = /** @type { NumTextElement } */ (document.createElement("num-text")),
    previewOption = document.createElement("li"),
    /** @type { boolean | undefined } */
    focused_override,
    changeIdentifier = Math.random().toString();

  document.body.setAttribute("data-editor-change",changeIdentifier);
  var transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);
  if (!name.includes(".")) name = `${name}.txt`;
  tab.classList.add("tab");
  tab.setAttribute("data-editor-identifier",identifier);
  if (value) tab.setAttribute("data-editor-refresh","");
  tab.addEventListener("mousedown",event => {
    if (document.activeElement === null) return;
    if (event.button != 0 || document.activeElement.matches("[data-editor-rename]")) return;
    event.preventDefault();
    if (tab != STE.query().tab) openEditor({ identifier });
  });
  tab.addEventListener("keydown",event => {
    if (event.key != " " && event.key != "Enter") return;
    event.preventDefault();
    if (tab != STE.query().tab) openEditor({ identifier });
  });
  tab.addEventListener("contextmenu",event => {
    if (event.target != tab) return;
    var editorRename = /** @type { HTMLInputElement } */ (tab.querySelector("[data-editor-rename]"));
    if (!editorRename){
      editorRename = document.createElement("input");
    } else return editorRename.blur();
    editorRename.type = "text";
    editorRename.placeholder = /** @type { string } */ (STE.query(identifier).getName());
    editorRename.setAttribute("data-editor-rename","");
    editorRename.tabIndex = -1;
    editorRename.style.setProperty("--editor-name-width",`${editorName.offsetWidth}px`);
    editorRename.value = /** @type { string } */ (STE.query(identifier).getName());
    editorRename.addEventListener("keydown",event => {
      if (event.key == "Escape") editorRename.blur();
    });
    editorRename.addEventListener("input",() => {
      editorRename.style.width = "0px";
      editorRename.offsetWidth;
      editorRename.style.setProperty("--editor-rename-width",`${editorRename.scrollWidth + 1}px`);
      editorRename.style.removeProperty("width");
    });
    editorRename.addEventListener("change",() => {
      if (editorRename.value) renameEditor({ name: editorRename.value, identifier });
      editorRename.blur();
    });
    editorRename.addEventListener("blur",() => editorRename.remove());
    tab.insertBefore(editorRename,tab.firstChild);
    applyEditingBehavior({ element: editorRename });
    editorRename.focus();
    editorRename.select();
  });
  tab.addEventListener("dragover",event => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer !== null) event.dataTransfer.dropEffect = "copy";
    if (tab != STE.query().tab) openEditor({ identifier });
  });
  editorName.setAttribute("data-editor-name",name);
  editorName.innerText = name;
  editorClose.classList.add("option");
  editorClose.tabIndex = -1;
  editorClose.innerHTML = "<svg><use href='#close_icon'/></svg>";
  editorClose.addEventListener("mousedown",event => {
    event.preventDefault();
    event.stopPropagation();
  });
  editorClose.addEventListener("click",event => {
    event.stopPropagation();
    closeEditor({ identifier });
  });
  container.classList.add("editor");
  container.setAttribute("data-editor-identifier",identifier);
  container.setAttribute("value",value);
  previewOption.part.add("option");
  previewOption.classList.add("option");
  previewOption.setAttribute("data-editor-identifier",identifier);
  previewOption.tabIndex = -1;
  previewOption.innerText = name;
  previewOption.addEventListener("click",() => setPreviewSource({ identifier }));
  if ((STE.activeEditor) ? STE.query().tab.hasAttribute("data-editor-auto-created") : false){
    if (document.activeElement == STE.query().container) focused_override = true;
    if (auto_replace){
      closeEditor();
    } else STE.query().tab.removeAttribute("data-editor-auto-created");
  }
  tab.appendChild(editorName);
  tab.appendChild(editorClose);
  workspace_tabs.insertBefore(tab,create_editor_button);
  workspace_editors.appendChild(container);
  container.editor.addEventListener("input",() => {
    if (tab.hasAttribute("data-editor-auto-created")) tab.removeAttribute("data-editor-auto-created");
    if (!tab.hasAttribute("data-editor-refresh")) tab.setAttribute("data-editor-refresh","");
    if (!tab.hasAttribute("data-editor-unsaved")) tab.setAttribute("data-editor-unsaved","");
    refreshPreview();
  });
  preview_menu.main.appendChild(previewOption);
  applyEditingBehavior({ element: container });
  if (open || !STE.activeEditor) openEditor({ identifier, auto_created, focused_override });
  container.syntaxLanguage = /** @type { string } */ (STE.query(identifier).getName("extension"));
  if ((STE.settings.get("syntax-highlighting") == true) && (container.syntaxLanguage in Prism.languages)) container.syntaxHighlight.enable();
  window.setTimeout(() => {
    if (document.body.getAttribute("data-editor-change") == changeIdentifier) document.body.removeAttribute("data-editor-change");
  },transitionDuration);
  return identifier;
}

/**
 * Opens an Editor from a given identifier.
 * 
 * @param { { identifier: string; auto_created?: boolean; focused_override?: boolean; } } options
*/
export function openEditor({ identifier, auto_created = false, focused_override = false }){
  if (!identifier) return;
  const { tab, container, textarea, getName } = STE.query(identifier),
    focused = (document.activeElement == STE.query().container) || focused_override;
  if (STE.query().tab) STE.query().tab.classList.remove("active");
  if (STE.query().container) STE.query().container.classList.remove("active");
  tab.classList.add("active");
  if (auto_created) tab.setAttribute("data-editor-auto-created","");
  container.classList.add("active");
  STE.activeEditor = identifier;
  setEditorTabsVisibility();
  setTitle({ content: /** @type { string } */ (getName()) });
  if ((((document.activeElement == document.body && !STE.activeDialog) || auto_created) && !STE.environment.touchDevice && STE.appearance.parentWindow) || focused) container.focus({ preventScroll: true });
  if (STE.previewEditor == "active-editor") refreshPreview({ force: (STE.settings.get("automatic-refresh") != false) });
}

/**
 * Closes an Editor from a given identifier.
*/
export function closeEditor({ identifier = STE.activeEditor } = {}){
  if (!identifier) return;
  var { tab, container, textarea, getName } = STE.query(identifier),
    previewOption = /** @type { Option } */ (preview_menu.main.querySelector(`.option[data-editor-identifier="${identifier}"]`)),
    active = (tab.classList.contains("active")),
    focused = (document.activeElement == container),
    editorTabs = Array.from(workspace_tabs.querySelectorAll(".tab:not([data-editor-change])"));
  if (tab.hasAttribute("data-editor-unsaved")){
    if (!confirm(`Are you sure you would like to close "${getName()}"?\nRecent changes have not yet been saved.`)) return;
  }
  var changeIdentifier = Math.random().toString();
  if (editorTabs.length != 1){
    document.body.setAttribute("data-editor-change",changeIdentifier);
    tab.style.setProperty("--tab-margin-right",`-${tab.offsetWidth}px`);
  } else if (document.body.hasAttribute("data-editor-change")){
    document.body.removeAttribute("data-editor-change");
    workspace_tabs.querySelectorAll(".tab[data-editor-change]").forEach(tab => workspace_tabs.removeChild(tab));
  }
  var transitionDuration = (document.body.hasAttribute("data-editor-change")) ? parseInt(`${Number(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`) : 0;
  if (tab == editorTabs[0] && editorTabs.length == 1){
    STE.activeEditor = null;
    setTitle({ reset: true });
    preview.src = "about:blank";
  }
  if (STE.previewEditor == identifier) setPreviewSource({ active_editor: true });
  if (tab == editorTabs[0] && editorTabs[1] && tab.classList.contains("active")) openEditor({ identifier: /** @type { string } */ (editorTabs[1].getAttribute("data-editor-identifier")) });
  if (tab == editorTabs[editorTabs.length - 1] && tab != editorTabs[0] && tab.classList.contains("active")) openEditor({ identifier: /** @type { string } */ (editorTabs[editorTabs.length - 2].getAttribute("data-editor-identifier")) });
  if (tab != editorTabs[0] && tab.classList.contains("active")) openEditor({ identifier: /** @type { string } */ (editorTabs[editorTabs.indexOf(tab) + 1].getAttribute("data-editor-identifier")) });
  if (focused && STE.query().textarea) STE.query().container.focus({ preventScroll: true });
  tab.setAttribute("data-editor-change","");
  if (tab == document.activeElement) tab.blur();
  tab.tabIndex = -1;
  if (tab.classList.contains("active")) tab.classList.remove("active");
  workspace_editors.removeChild(container);
  preview_menu.main.removeChild(previewOption);
  (transitionDuration) ? window.setTimeout(removeEditorTab,transitionDuration) : removeEditorTab();
  if (STE.fileHandles[identifier]) delete STE.fileHandles[identifier];
  function removeEditorTab(){
    if (workspace_tabs.contains(tab)) workspace_tabs.removeChild(tab);
    if (document.body.getAttribute("data-editor-change") == changeIdentifier) document.body.removeAttribute("data-editor-change");
  }
}

/**
 * Renames an Editor from a given identifier.
 * 
 * @param { { name?: string; identifier?: string | null | undefined; } | undefined } options
*/
export function renameEditor({ name, identifier = STE.activeEditor } = {}){
  const { tab, container, getName } = STE.query(identifier),
    editorName = /** @type { HTMLSpanElement } */ (tab.querySelector("[data-editor-name]")),
    previewOption = /** @type { Option } */ (preview_menu.main.querySelector(`.option[data-editor-identifier="${identifier}"]`)),
    currentName = /** @type { string } */ (getName()),
    base = getName("base"),
    extension = getName("extension");
  let rename = (name) ? name : prompt(`Enter a new file name for "${currentName}".`,currentName);

  if (!rename) return;
  if (!rename.includes(".")){
    rename = `${rename}.${extension}`;
  } else if (rename.charAt(0) == ".") rename = `${base}${rename}`;
  editorName.innerText = rename;
  previewOption.innerText = rename;
  var syntaxLanguage = /** @type { string } */ (STE.query(identifier).getName("extension"));
  if (syntaxLanguage in Prism.languages) container.syntaxLanguage = syntaxLanguage;
  ((STE.settings.get("syntax-highlighting") == true) && (syntaxLanguage in Prism.languages)) ? container.syntaxHighlight.enable() : container.syntaxHighlight.disable();
  if (syntaxLanguage != container.syntaxLanguage) container.syntaxLanguage = syntaxLanguage;
  if (tab.hasAttribute("data-editor-auto-created")) tab.removeAttribute("data-editor-auto-created");
  if (tab == STE.query().tab) setTitle({ content: rename });
  if ((STE.previewEditor == "active-editor" && STE.activeEditor == identifier) || STE.previewEditor == identifier) refreshPreview({ force: true });
  return rename;
}

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