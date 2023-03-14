import { getElementStyle } from "./app.js";
import { Editor, setEditorTabsVisibility } from "./Editor.js";
import { read, stringify } from "nbtify";

declare global {
  interface Window {
    setView: typeof setView;
    setOrientation: typeof setOrientation;
    setPreviewSource: typeof setPreviewSource;
    createWindow: typeof createWindow;
    openFiles: typeof openFiles;
    saveFile: typeof saveFile;
    createDisplay: typeof createDisplay;
    refreshPreview: typeof refreshPreview;
  }
}

window.setView = setView;
window.setOrientation = setOrientation;
window.setPreviewSource = setPreviewSource;
window.createWindow = createWindow;
window.openFiles = openFiles;
window.saveFile = saveFile;
window.createDisplay = createDisplay;
window.refreshPreview = refreshPreview;

export type View = "code" | "split" | "preview";

export interface SetViewOptions {
  force?: boolean;
}

/**
 * Sets the View state of the app. If a View change is already in progress, and the force option is not set to `true`, the call will be skipped.
*/
export function setView(type: View, { force = false }: SetViewOptions = {}){
  if ((STE.orientationChange && !force) || STE.scalingChange) return;
  var changeIdentifier = Math.random().toString();
  document.body.setAttribute("data-view-change",changeIdentifier);
  var transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);
  document.body.classList.remove(STE.view);
  document.body.setAttribute("data-view",type);
  document.body.classList.add(STE.view);
  removeScaling();
  view_menu.select(STE.view);
  if (type != "preview") window.setTimeout(setEditorTabsVisibility,transitionDuration);
  window.setTimeout(() => {
    if (document.body.getAttribute("data-view-change") == changeIdentifier) document.body.removeAttribute("data-view-change");
  },transitionDuration);
  refreshPreview();
}

export type Orientation = "horizontal" | "vertical";

/**
 * Sets the Orientation state of the app. If an Orientation change is already in progress, the call will be skipped.
 * 
 * @param orientation - If an Orientation type is not provided, the current state will be toggled to the other option.
*/
export function setOrientation(orientation?: Orientation){
  if (STE.orientationChange || STE.scalingChange) return;
  document.body.setAttribute("data-orientation-change","");
  var param = (orientation), transitionDuration = ((STE.view != "split") ? 0 : parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`));
  if (!param && STE.view == "split") setView("code",{ force: true });
  if (!param && STE.orientation == "horizontal") orientation = "vertical";
  if (!param && STE.orientation == "vertical") orientation = "horizontal";
  window.setTimeout(() => {
    setTransitionDurations("off");
    document.body.classList.remove(STE.orientation);
    document.body.setAttribute("data-orientation",orientation!);
    document.body.classList.add(STE.orientation);
    workspace.offsetHeight;
    scaler.offsetHeight;
    preview.offsetHeight;
    setTransitionDurations("on");
    if (!param) setView("split",{ force: true });
    window.setTimeout(() => document.body.removeAttribute("data-orientation-change"),transitionDuration);
  },transitionDuration);

  function setTransitionDurations(state: "on" | "off"){
    if (state == "on"){
      workspace.style.removeProperty("transition-duration");
      scaler.style.removeProperty("transition-duration");
      preview.style.removeProperty("transition-duration");
    }
    if (state == "off"){
      workspace.style.transitionDuration = "0s";
      scaler.style.transitionDuration = "0s";
      preview.style.transitionDuration = "0s";
    }
  }
}

/**
 * Sets the source for the Preview to a given Editor.
*/
export function setPreviewSource({ identifier, active_editor }: { identifier?: string; active_editor?: boolean; }){
  if (!identifier && !active_editor) return;
  if ((!identifier && active_editor) || (STE.previewEditor == identifier)){
    STE.previewEditor = "active-editor";
    preview_menu.select("active-editor");
  } else STE.previewEditor = identifier!;
  refreshPreview({ force: true });
}

/**
 * Creates a new Smart Text Editor window.
*/
export function createWindow(){
  const features = (STE.appearance.standalone || STE.appearance.fullscreen) ? "popup" : "",
    win = window.open(window.location.href,"_blank",features);

  if (win === null) throw new Error("Couldn't create a new Smart Text Editor window");
  if (STE.appearance.fullscreen){
    win.resizeTo(window.screen.width * 2/3,window.screen.height * 2/3);
    win.moveTo(window.screen.width / 6,window.screen.height / 6);
  } else if (STE.appearance.standalone){
    win.resizeTo(window.outerWidth,window.outerHeight);
    win.moveTo(window.screenX,window.screenY);
  }
}

/**
 * Creates new Editors in the Workspace from files chosen by the user through a file system file picker.
 * 
 * If the File System Access API is supported in the user's browser, it will use that. If not, it will fall back to using an `<input type="file">` element.
*/
export async function openFiles(){
  if (!STE.support.fileSystem){
    const input = Object.assign(document.createElement("input"),{
      type: "file",
      multiple: true
    });

    await new Promise(resolve => {
      input.addEventListener("change",resolve,{ once: true });
      input.click();
    });

    if (input.files === null) return;

    const results = await Promise.allSettled([...input.files].map(async file => {
      const { name } = file;
      const value = (name.match(/.(nbt|dat)$/)) ? await file.arrayBuffer().then(read).then(({ data }) => stringify(data,{ space: 2 })) : await file.text();
      return { name, value };
    }));

    const files = results
      .filter(/** @returns { result is PromiseFulfilledResult<{ name: string; value: string; }> } */
        (result): result is PromiseFulfilledResult<{ name: string; value: string; }> => result.status === "fulfilled")
      .map(result => result.value);

    for (const file of files){
      new Editor(file);
    }
  } else {
    var handles = await window.showOpenFilePicker({ multiple: true }).catch(error => {
      if (error.message.toLowerCase().includes("abort")) return;
    });
    if (!handles) return;
    handles.forEach(async handle => {
      var file = await handle.getFile(), { identifier } = new Editor({ name: file.name, value: await file.text() });
      STE.fileHandles[identifier] = handle;
    });
  }
}

/**
 * Saves an Editor as a file back to the user's file system.
 * 
 * If the File System Access API is supported in the user's browser, the Editor's current value will be rewritten directly to the file system.
 * 
 * If the File System Access API is not supported, or if a custom file extension is provided for the current file, a Save As dialog will be shown using an `<a download href="blob:">` element.
*/
export async function saveFile(extension?: string){
  if (extension || !STE.support.fileSystem){
    if (!extension) extension = STE.query().getName("extension") ?? "";
    var anchor = document.createElement("a"), link = window.URL.createObjectURL(new Blob([STE.query().textarea?.value ?? ""]));
    anchor.href = link;
    anchor.download = `${STE.query().getName("base")}.${extension}`;
    anchor.click();
    window.URL.revokeObjectURL(link);
  } else {
    var identifier = STE.activeEditor, handle;
    if (identifier === null) throw new Error("No editors are open, couldn't save anything!");
    if (!STE.fileHandles[identifier]){
      handle = await window.showSaveFilePicker({ suggestedName: STE.query().getName()!, startIn: (STE.fileHandles[identifier]) ? STE.fileHandles[identifier] : "desktop" }).catch(error => {
        if (error.message.toLowerCase().includes("abort")) return;
      });
      if (!handle) return;
      STE.fileHandles[identifier] = handle;
    } else handle = STE.fileHandles[identifier];
    var stream = await STE.fileHandles[identifier].createWritable().catch(error => {
      alert(`"${STE.query().getName()}" could not be saved.`);
      if (error.toString().toLowerCase().includes("not allowed")) return;
    });
    if (!stream) return;
    await stream.write(STE.query().textarea?.value ?? "");
    await stream.close();
    var currentName = STE.query().getName(), file = await handle.getFile(), rename = file.name;
    if (currentName != rename) Editor.rename(identifier,rename);
  }
  if (STE.query().tab?.hasAttribute("data-editor-auto-created")) STE.query().tab?.removeAttribute("data-editor-auto-created");
  if (STE.query().tab?.hasAttribute("data-editor-unsaved")) STE.query().tab?.removeAttribute("data-editor-unsaved");
  refreshPreview({ force: true });
}

/**
 * Creates a new Display window for the active Editor.
*/
export function createDisplay(){
  var width = window.screen.availWidth * 2/3,
    height = window.screen.availHeight * 2/3,
    left = window.screen.availWidth / 2 + window.screen.availLeft - width / 2,
    top = window.screen.availHeight / 2 + window.screen.availTop - height / 2,
    features = (STE.appearance.standalone || STE.appearance.fullscreen) ? "popup" : "",
    baseURL = STE.settings.get("preview-base") || null,
    source = STE.query().textarea?.value ?? "";
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  var link = window.URL.createObjectURL(new Blob([source],{ type: "text/html" })),
    win = window.open(link,"_blank",features);

  if (win === null) throw new Error("Couldn't create a display window!");
  window.URL.revokeObjectURL(link);
  win.moveTo(left,top);
  win.resizeTo(width,height);
  STE.childWindows.push(win);
  window.setTimeout(() => {
    if (win === null) return;
    if (!win.document.title) win.document.title = STE.query().getName()!;
  },20);
}

/**
 * Refreshes the Preview with the latest source from the source Editor.
*/
export function refreshPreview({ force = false } = {}){
  if (STE.view == "code") return;
  var editor = (STE.previewEditor == "active-editor") ? STE.query() : STE.query(STE.previewEditor);
  if (!editor.tab || !editor.textarea) return;
  var change = (editor.tab.hasAttribute("data-editor-refresh") && STE.settings.get("automatic-refresh") != "false");
  if (!change && !force) return;
  var baseURL = STE.settings.get("preview-base") || null, source = editor.textarea.value;
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  preview.addEventListener("load",() => {
    preview.contentWindow?.document.open();
    preview.contentWindow?.document.write(source);
    preview.contentWindow?.document.close();
  },{ once: true });
  preview.src = "about:blank";
  if (change) editor.tab.removeAttribute("data-editor-refresh");
}

/**
 * Sets the Split mode scaling when called from the Scaler's moving event listeners.
*/
export function setScaling(event: MouseEvent | TouchEvent){
  const { safeAreaInsets: safeAreaInsets } = STE.appearance;
  let scalingOffset = 0;
  const scalingRange = {
    minimum: ((STE.orientation == "vertical") ? workspace_tabs.offsetHeight : safeAreaInsets.left) + 80,
    maximum: ((STE.orientation == "horizontal") ? window.innerWidth - safeAreaInsets.right : (STE.orientation == "vertical") ? (window.innerHeight - header.offsetHeight - safeAreaInsets.bottom) : 0) - 80
  };
  const touchEvent = (STE.environment.touchDevice && event instanceof TouchEvent);

  if (STE.orientation == "horizontal") scalingOffset = (!touchEvent) ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].pageX;
  if (STE.orientation == "vertical") scalingOffset = (!touchEvent) ? (event as MouseEvent).pageY - header.offsetHeight : (event as TouchEvent).touches[0].pageY - header.offsetHeight;
  if (scalingOffset < scalingRange.minimum) scalingOffset = scalingRange.minimum;
  if (scalingOffset > scalingRange.maximum) scalingOffset = scalingRange.maximum;
  document.body.setAttribute("data-scaling-active","");
  workspace.style.setProperty("--scaling-offset",`${scalingOffset}px`);
  scaler.style.setProperty("--scaling-offset",`${scalingOffset}px`);
  preview.style.setProperty("--scaling-offset",`${scalingOffset}px`);
}

/**
 * Removes the Split mode scale handling when the user finishes moving the Scaler.
*/
export function disableScaling(event: MouseEvent | TouchEvent){
  var touchEvent = (STE.environment.touchDevice && event instanceof TouchEvent);
  document.removeEventListener((!touchEvent) ? "mousemove" : "touchmove",setScaling);
  document.removeEventListener((!touchEvent) ? "mouseup" : "touchend",disableScaling);
  document.body.removeAttribute("data-scaling-change");
}

/**
 * Resets the Split mode scaling offsets, making the Workspace responsive again.
*/
function removeScaling(){
  if (!document.body.hasAttribute("data-scaling-active")) return;
  document.body.removeAttribute("data-scaling-active");
  workspace.style.removeProperty("--scaling-offset");
  scaler.style.removeProperty("--scaling-offset");
  preview.style.removeProperty("--scaling-offset");
}