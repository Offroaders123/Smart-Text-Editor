import { orientationChange, scalingChange, view, orientation, previewEditor, setPreviewEditor, appearance, support, activeEditor, settings, childWindows, preview as getPreview, scaler as getScaler, workspace as getWorkspace } from "./STE.js";
import { createEditor, setTabsVisibility } from "./Editor.js";
import WorkspaceTabs from "./WorkspaceTabs.js";
import WorkspaceEditors from "./WorkspaceEditors.js";
import { getElementStyle } from "./dom.js";
import "./Workspace.scss";

import type { Setter } from "solid-js";
import type { default as Editor, EditorOptions } from "./Editor.js";

export interface WorkspaceProps {
  setWorkspace: Setter<HTMLDivElement | null>;
  setWorkspaceTabs: Setter<HTMLDivElement | null>;
  setCreateEditorButton: Setter<HTMLButtonElement | null>;
  setWorkspaceEditors: Setter<HTMLDivElement | null>;
}

export default function Workspace(props: WorkspaceProps) {
  return (
    <div
      ref={props.setWorkspace}
      class="workspace">
      <WorkspaceTabs
        setWorkspaceTabs={props.setWorkspaceTabs}
        setCreateEditorButton={props.setCreateEditorButton}
      />
      <WorkspaceEditors
        setWorkspaceEditors={props.setWorkspaceEditors}
      />
    </div>
  );
}

export type View = "code" | "split" | "preview";

export interface SetViewOptions {
  force?: boolean;
}

/**
 * Sets the View state of the app. If a View change is already in progress, and the force option is not set to `true`, the call will be skipped.
*/
export async function setView(type: View, { force = false }: SetViewOptions = {}): Promise<void> {
  if ((orientationChange() && !force) || scalingChange()) return;

  const workspace: HTMLDivElement = getWorkspace()!;
  const changeIdentifier: string = Math.random().toString();
  document.body.setAttribute("data-view-change",changeIdentifier);

  const transitionDuration: number = parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
  document.body.classList.remove(view());
  document.body.setAttribute("data-view",type);
  document.body.classList.add(view());
  removeScaling();
  view_menu.select(view());

  refreshPreview();

  await new Promise<void>(resolve => setTimeout(resolve,transitionDuration));

  if (type !== "preview"){
    setTabsVisibility();
  }
  if (document.body.getAttribute("data-view-change") === changeIdentifier){
    document.body.removeAttribute("data-view-change");
  }
}

export type Orientation = "horizontal" | "vertical";

/**
 * Sets the Orientation state of the app. If an Orientation change is already in progress, the call will be skipped.
 * 
 * @param orientationValue If an Orientation type is not provided, the current state will be toggled to the other option.
*/
export async function setOrientation(orientationValue?: Orientation): Promise<void> {
  if (orientationChange() || scalingChange()) return;
  const workspace: HTMLDivElement = getWorkspace()!;
  const scaler: HTMLDivElement = getScaler()!;
  const preview: HTMLIFrameElement = getPreview()!;

  document.body.setAttribute("data-orientation-change","");
  const param: boolean = orientationValue !== undefined;
  const transitionDuration: number = ((view() != "split") ? 0 : parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`));

  if (!param && view() == "split"){
    setView("code",{ force: true });
  }
  if (!param && orientation() === "horizontal"){
    orientationValue = "vertical";
  }
  if (!param && orientation() === "vertical"){
    orientationValue = "horizontal";
  }

  await new Promise<void>(resolve => setTimeout(resolve,transitionDuration));

  workspace.style.transitionDuration = "0s";
  scaler.style.transitionDuration = "0s";
  preview.style.transitionDuration = "0s";
  document.body.classList.remove(orientation());
  document.body.setAttribute("data-orientation",orientationValue!);
  document.body.classList.add(orientation());
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
 * @see {@link previewEditor}
*/
export async function setPreviewSource(previewEditorValue: Editor | null): Promise<void> {
  setPreviewEditor(previewEditorValue);

  if (previewEditorValue === null){
    preview_menu.select("active-editor");
  }

  await refreshPreview({ force: true });
}

/**
 * Creates a new Smart Text Editor window.
*/
export function createWindow(): void {
  const features = (appearance.standalone || appearance.fullscreen) ? "popup" : "",
    win = window.open(window.location.href,"_blank",features);

  if (win === null) throw new Error("Couldn't create a new Smart Text Editor window");
  if (appearance.fullscreen){
    win.resizeTo(window.screen.width * 2/3,window.screen.height * 2/3);
    win.moveTo(window.screen.width / 6,window.screen.height / 6);
  } else if (appearance.standalone){
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
  if (!support.fileSystem){
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
      createEditor(file);
    }
  } else {
    const handles = await window.showOpenFilePicker({ multiple: true }).catch(error => {
      if (error.message.toLowerCase().includes("abort")) return;
    });
    if (!handles) return;
    handles.forEach(async handle => {
      const file = await handle.getFile();
      createEditor({ name: file.name, value: await file.text(), handle });
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
  if (extension || !support.fileSystem){
    if (!extension) extension = activeEditor()?.extension;
    const anchor = document.createElement("a");
    const link = window.URL.createObjectURL(new Blob([activeEditor()?.editor.value ?? ""]));
    anchor.href = link;
    anchor.download = `${
      // @ts-expect-error
      activeEditor()?.basename satisfies string
    }.${extension}`;
    anchor.click();
    window.URL.revokeObjectURL(link);
  } else {
    const identifier = activeEditor();
    let handle: void | FileSystemFileHandle;
    if (identifier === null) throw new Error("No editors are open, couldn't save anything!");
    if (!identifier.handle){
      handle = await window.showSaveFilePicker({
        suggestedName:
          // @ts-expect-error
          activeEditor()?.name satisfies string,
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
        activeEditor()?.name satisfies string
      }" could not be saved.`);
      if (error.toString().toLowerCase().includes("not allowed")) return;
    });
    if (!stream) return;
    await stream.write(
      // @ts-expect-error
      activeEditor()?.editor.value satisfies string
    );
    await stream.close();
    // @ts-expect-error
    const currentName: string = activeEditor()?.name;
    const file = await handle.getFile();
    const rename = file.name;
    if (currentName != rename) identifier.rename(rename);
  }
  if (activeEditor()?.autoCreated){
    activeEditor()!.autoCreated = false;
  }
  if (activeEditor()?.unsaved){
    activeEditor()!.unsaved = false;
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
    features = (appearance.standalone || appearance.fullscreen) ? "popup" : "",
    baseURL = settings.previewBase;
  // @ts-expect-error
  let source: string = activeEditor()?.editor.value;
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  const link = window.URL.createObjectURL(new Blob([source],{ type: "text/html" })),
    win = window.open(link,"_blank",features);

  if (win === null) throw new Error("Couldn't create a display window!");
  window.URL.revokeObjectURL(link);
  win.moveTo(left,top);
  win.resizeTo(width,height);
  childWindows.push(win);
  window.setTimeout(() => {
    if (win === null) return;
    if (!win.document.title){
      // @ts-expect-error
      win.document.title = activeEditor()?.name;
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
  if (view() === "code") return;

  const editor: Editor | null = previewEditor() ?? activeEditor();
  if (editor === null) return;
  const change: boolean = editor.refresh && !settings.automaticRefresh;
  if (!change && !force) return;
  
  const preview: HTMLIFrameElement = getPreview()!;
  const baseURL: string | null = settings.previewBase;
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
 * Resets the Split mode scaling offsets, making the Workspace responsive again.
*/
function removeScaling(): void {
  if (!document.body.hasAttribute("data-scaling-active")) return;
  const workspace: HTMLDivElement = getWorkspace()!;
  const scaler: HTMLDivElement = getScaler()!;
  const preview: HTMLIFrameElement = getPreview()!;
  document.body.removeAttribute("data-scaling-active");
  workspace.style.removeProperty("--scaling-offset");
  scaler.style.removeProperty("--scaling-offset");
  preview.style.removeProperty("--scaling-offset");
}