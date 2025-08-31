import { orientationChange, scalingChange, view, orientation, childWindows, preview as getPreview, scaler as getScaler, workspace as getWorkspace, viewMenu, scalingActive_, setScalingActive_, setOrientationChange_, setViewChange_, viewChange_, setView_, setOrientation_ } from "../app.js";
import WorkspaceEditors from "./WorkspaceEditors.js";
import { appearance } from "../appearance.js";
import { settings } from "../settings.js";
import { getElementStyle } from "../dom.js";
import "./Workspace.scss";

import type { Setter } from "solid-js";

export interface WorkspaceProps {
  setWorkspace: Setter<HTMLDivElement | null>;
  setWorkspaceEditors: Setter<HTMLDivElement | null>;
}

export default function Workspace(props: WorkspaceProps) {
  return (
    <div
      ref={props.setWorkspace}
      class="workspace">
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
  setViewChange_(changeIdentifier); // eventually remove line below
  document.body.setAttribute("data-view-change",changeIdentifier);

  const transitionDuration: number = parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
  document.body.classList.remove(view());
  setView_(type);
  document.body.classList.add(view());
  removeScaling();
  viewMenu()!.select(view());

  refreshPreview();

  await new Promise<void>(resolve => setTimeout(resolve,transitionDuration));

  if (viewChange_() === changeIdentifier){
    setViewChange_(null); // eventually remove line below
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

  setOrientationChange_(true); // eventually remove line below
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
  setOrientation_(orientationValue!);
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

  setOrientationChange_(false); // eventually remove line below
  document.body.removeAttribute("data-orientation-change");
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
 * Creates a new Display window for the active Editor.
*/
export function createDisplay(): void {
  const width = window.screen.availWidth * 2/3,
    height = window.screen.availHeight * 2/3,
    left = window.screen.availWidth / 2 + window.screen.availLeft - width / 2,
    top = window.screen.availHeight / 2 + window.screen.availTop - height / 2,
    features = (appearance.standalone || appearance.fullscreen) ? "popup" : "",
    baseURL = settings.previewBase;
  //// @ts-expect-error
  let source: string = editorRef().editor.value;
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
      //// @ts-expect-error
      win.document.title = editorName();
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

  const editor: NumTextElement = editorRef();
  if (editor === null) return;
  const change: boolean = editorRefresh() && settings.automaticRefresh !== false;
  if (!change && !force) return;
  
  const preview: HTMLIFrameElement = getPreview()!;
  const baseURL: string | null = settings.previewBase;
  let source: string = editorValue();
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

  if (change) setEditorRefresh(false);
}

/**
 * Resets the Split mode scaling offsets, making the Workspace responsive again.
*/
function removeScaling(): void {
  if (!scalingActive_()) return;
  const workspace: HTMLDivElement = getWorkspace()!;
  const scaler: HTMLDivElement = getScaler()!;
  const preview: HTMLIFrameElement = getPreview()!;
  setScalingActive_(false); // eventually remove line below
  document.body.removeAttribute("data-scaling-active");
  workspace.style.removeProperty("--scaling-offset");
  scaler.style.removeProperty("--scaling-offset");
  preview.style.removeProperty("--scaling-offset");
}