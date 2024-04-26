import * as STE from "./STE.js";
import Editor from "./Editor.js";
import { getElementStyle } from "./dom.js";

import type { EditorOptions } from "./Editor.js";

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
export async function setView(type: View, { force = false }: SetViewOptions = {}): Promise<void> {
  if ((STE.orientationChange() && !force) || STE.scalingChange()) return;

  const changeIdentifier: string = Math.random().toString();
  document.body.setAttribute("data-view-change",changeIdentifier);

  const transitionDuration: number = parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
  document.body.classList.remove(STE.view());
  document.body.setAttribute("data-view",type);
  document.body.classList.add(STE.view());
  removeScaling();
  view_menu.select(STE.view());

  refreshPreview();

  await new Promise<void>(resolve => setTimeout(resolve,transitionDuration));

  if (type !== "preview"){
    Editor.setTabsVisibility();
  }
  if (document.body.getAttribute("data-view-change") === changeIdentifier){
    document.body.removeAttribute("data-view-change");
  }
}

export type Orientation = "horizontal" | "vertical";

/**
 * Sets the Orientation state of the app. If an Orientation change is already in progress, the call will be skipped.
 * 
 * @param orientation If an Orientation type is not provided, the current state will be toggled to the other option.
*/
export async function setOrientation(orientation?: Orientation): Promise<void> {
  if (STE.orientationChange() || STE.scalingChange()) return;

  document.body.setAttribute("data-orientation-change","");
  const param: boolean = orientation !== undefined;
  const transitionDuration: number = ((STE.view() != "split") ? 0 : parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`));

  if (!param && STE.view() == "split"){
    setView("code",{ force: true });
  }
  if (!param && STE.orientation() === "horizontal"){
    orientation = "vertical";
  }
  if (!param && STE.orientation() === "vertical"){
    orientation = "horizontal";
  }

  await new Promise<void>(resolve => setTimeout(resolve,transitionDuration));

  workspace.style.transitionDuration = "0s";
  scaler.style.transitionDuration = "0s";
  preview.style.transitionDuration = "0s";
  document.body.classList.remove(STE.orientation());
  document.body.setAttribute("data-orientation",orientation!);
  document.body.classList.add(STE.orientation());
  workspace.offsetHeight;
  scaler.offsetHeight;
  preview.offsetHeight;
  workspace.style.removeProperty("transition-duration");
  scaler.style.removeProperty("transition-duration");
  preview.style.removeProperty("transition-duration");
  if (!param){
    setView("split",{ force: true });
  }

  await new Promise(resolve => setTimeout(resolve,transitionDuration));

  document.body.removeAttribute("data-orientation-change");
}

/**
 * Sets the source for the Preview to a given Editor.
 * 
 * @see {@link STE.previewEditor}
*/
export async function setPreviewSource(previewEditor: Editor | null): Promise<void> {
  STE.setPreviewEditor(previewEditor);

  if (previewEditor === null){
    preview_menu.select("active-editor");
  }

  await refreshPreview({ force: true });
}

/**
 * Creates a new Smart Text Editor window.
*/
export function createWindow(): void {
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
export async function openFiles(): Promise<void> {
  if (!STE.support.fileSystem){
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    await new Promise(resolve => {
      input.addEventListener("change",resolve,{ once: true });
      input.click();
    });

    if (input.files === null) return;

    const results: PromiseSettledResult<EditorOptions>[] = await Promise.allSettled([...input.files].map(async file => {
      const { name } = file;
      const value = await file.text();
      return { name, value };
    }));

    const files: EditorOptions[] = results
      .filter(
        (result): result is PromiseFulfilledResult<EditorOptions> => result.status === "fulfilled")
      .map(result => result.value);

    for (const file of files){
      new Editor(file);
    }
  } else {
    const handles = await window.showOpenFilePicker({ multiple: true }).catch(error => {
      if (error.message.toLowerCase().includes("abort")) return;
    });
    if (!handles) return;
    handles.forEach(async handle => {
      const file = await handle.getFile();
      new Editor({ name: file.name, value: await file.text(), handle });
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
export async function saveFile(extension?: string): Promise<void> {
  if (extension || !STE.support.fileSystem){
    if (!extension) extension = STE.activeEditor()?.extension;
    const anchor = document.createElement("a");
    const link = window.URL.createObjectURL(new Blob([STE.activeEditor()?.editor.value ?? ""]));
    anchor.href = link;
    anchor.download = `${
      // @ts-expect-error
      STE.activeEditor()?.basename satisfies string
    }.${extension}`;
    anchor.click();
    window.URL.revokeObjectURL(link);
  } else {
    const identifier = STE.activeEditor();
    let handle: void | FileSystemFileHandle;
    if (identifier === null) throw new Error("No editors are open, couldn't save anything!");
    if (!identifier.handle){
      handle = await window.showSaveFilePicker({
        suggestedName:
          // @ts-expect-error
          STE.activeEditor()?.name satisfies string,
        startIn: (identifier.handle) ? identifier.handle : "desktop"
      }).catch(error => {
        if (error.message.toLowerCase().includes("abort")) return;
      });
      if (!handle) return;
      identifier.handle = handle;
    } else handle = identifier.handle!;
    const stream = await identifier.handle?.createWritable().catch(error => {
      alert(`"${
        // @ts-expect-error
        STE.activeEditor()?.name satisfies string
      }" could not be saved.`);
      if (error.toString().toLowerCase().includes("not allowed")) return;
    });
    if (!stream) return;
    await stream.write(
      // @ts-expect-error
      STE.activeEditor()?.editor.value satisfies string
    );
    await stream.close();
    // @ts-expect-error
    const currentName: string = STE.activeEditor()?.name;
    const file = await handle.getFile();
    const rename = file.name;
    if (currentName != rename) identifier.rename(rename);
  }
  if (STE.activeEditor()?.autoCreated){
    STE.activeEditor()!.autoCreated = false;
  }
  if (STE.activeEditor()?.unsaved){
    STE.activeEditor()!.unsaved = false;
  }
  await refreshPreview({ force: true });
}

/**
 * Creates a new Display window for the active Editor.
*/
export function createDisplay(): void {
  const width = window.screen.availWidth * 2/3,
    height = window.screen.availHeight * 2/3,
    left = window.screen.availWidth / 2 + window.screen.availLeft - width / 2,
    top = window.screen.availHeight / 2 + window.screen.availTop - height / 2,
    features = (STE.appearance.standalone || STE.appearance.fullscreen) ? "popup" : "",
    baseURL = STE.settings.previewBase;
  // @ts-expect-error
  let source: string = STE.activeEditor()?.editor.value;
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  const link = window.URL.createObjectURL(new Blob([source],{ type: "text/html" })),
    win = window.open(link,"_blank",features);

  if (win === null) throw new Error("Couldn't create a display window!");
  window.URL.revokeObjectURL(link);
  win.moveTo(left,top);
  win.resizeTo(width,height);
  STE.childWindows.push(win);
  window.setTimeout(() => {
    if (win === null) return;
    if (!win.document.title){
      // @ts-expect-error
      win.document.title = STE.activeEditor()?.name;
    }
  },20);
}

export interface RefreshPreviewOptions {
  force?: boolean;
}

/**
 * Refreshes the Preview with the latest source from the source Editor.
*/
export async function refreshPreview({ force = false }: RefreshPreviewOptions = {}): Promise<void> {
  if (STE.view() === "code") return;

  const editor: Editor | null = STE.previewEditor() ?? STE.activeEditor();
  if (editor === null) return;
  const change: boolean = editor.refresh && !STE.settings.automaticRefresh;
  if (!change && !force) return;

  const baseURL: string | null = STE.settings.previewBase;
  let source: string = editor.editor.value;
  if (baseURL !== null){
    source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  }

  await new Promise<void>((resolve,reject) => {
    preview.addEventListener("load",() => resolve(),{ once: true });
    preview.addEventListener("error",() => reject(),{ once: true });
    preview.src = "about:blank";
  });

  preview.contentDocument?.open();
  preview.contentDocument?.write(source);
  preview.contentDocument?.close();

  if (change) editor.refresh = false;
}

/**
 * Sets the Split mode scaling when called from the Scaler's moving event listeners.
*/
export function setScaling(event: MouseEvent | TouchEvent): void {
  const { safeAreaInsets } = STE.appearance;
  let scalingOffset = 0;
  const scalingRange = {
    minimum: ((STE.orientation() == "vertical") ? workspace_tabs.offsetHeight : safeAreaInsets.left) + 80,
    maximum: ((STE.orientation() == "horizontal") ? window.innerWidth - safeAreaInsets.right : (STE.orientation() == "vertical") ? (window.innerHeight - header.offsetHeight - safeAreaInsets.bottom) : 0) - 80
  };
  const touchEvent = (STE.environment.touchDevice && event instanceof TouchEvent);

  if (STE.orientation() == "horizontal") scalingOffset = (!touchEvent) ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0]!.pageX;
  if (STE.orientation() == "vertical") scalingOffset = (!touchEvent) ? (event as MouseEvent).pageY - header.offsetHeight : (event as TouchEvent).touches[0]!.pageY - header.offsetHeight;
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
export function disableScaling(event: MouseEvent | TouchEvent): void {
  const touchEvent = (STE.environment.touchDevice && event instanceof TouchEvent);
  document.removeEventListener((!touchEvent) ? "mousemove" : "touchmove",setScaling);
  document.removeEventListener((!touchEvent) ? "mouseup" : "touchend",disableScaling);
  document.body.removeAttribute("data-scaling-change");
}

/**
 * Resets the Split mode scaling offsets, making the Workspace responsive again.
*/
function removeScaling(): void {
  if (!document.body.hasAttribute("data-scaling-active")) return;
  document.body.removeAttribute("data-scaling-active");
  workspace.style.removeProperty("--scaling-offset");
  scaler.style.removeProperty("--scaling-offset");
  preview.style.removeProperty("--scaling-offset");
}