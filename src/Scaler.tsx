import { createEffect } from "solid-js";
import { appearance, environment, header as getHeader, orientation, preview as getPreview, scaler as getScaler, view, workspace as getWorkspace, workspaceTabs } from "./app.js";
import "./Scaler.scss";

import type { Setter } from "solid-js";

export interface ScalerProps {
  setScaler: Setter<HTMLDivElement | null>;
}

export default function Scaler(props: ScalerProps) {
  let ref: HTMLDivElement;

  createEffect(() => {
    ref.addEventListener("touchstart",event => {
      if (view() !== "split" || event.touches.length !== 1) return;
      document.body.setAttribute("data-scaling-change","");
      document.addEventListener("touchmove",setScaling,{ passive: true });
      document.addEventListener("touchend",disableScaling,{ passive: true });
    },{ passive: true });
  });

  return (
    <div
      ref={scaler => { ref = scaler; props.setScaler(scaler); }}
      class="scaler"
      onmousedown={event => {
        if (event.button !== 0) return;
        if (view() !== "split") return;
        event.preventDefault();
        document.body.setAttribute("data-scaling-change","");
        document.addEventListener("mousemove",setScaling);
        document.addEventListener("mouseup",disableScaling);
      }}
    />
  );
}

/**
 * Sets the Split mode scaling when called from the Scaler's moving event listeners.
*/
function setScaling(event: MouseEvent | TouchEvent): void {
  const header: HTMLElement = getHeader()!;
  const workspace: HTMLDivElement = getWorkspace()!;
  const workspace_tabs: HTMLDivElement = workspaceTabs()!;
  const scaler: HTMLDivElement = getScaler()!;
  const preview: HTMLIFrameElement = getPreview()!;
  const { safeAreaInsets } = appearance;
  let scalingOffset = 0;
  const scalingRange = {
    minimum: ((orientation() == "vertical") ? workspace_tabs.offsetHeight : safeAreaInsets.left) + 80,
    maximum: ((orientation() == "horizontal") ? window.innerWidth - safeAreaInsets.right : (orientation() == "vertical") ? (window.innerHeight - header.offsetHeight - safeAreaInsets.bottom) : 0) - 80
  };
  const touchEvent = ((event: MouseEvent | TouchEvent): event is TouchEvent => environment.touchDevice && event instanceof TouchEvent);

  if (orientation() == "horizontal") scalingOffset = (!touchEvent(event)) ? event.pageX : event.touches[0]!.pageX;
  if (orientation() == "vertical") scalingOffset = (!touchEvent(event)) ? event.pageY - header.offsetHeight : event.touches[0]!.pageY - header.offsetHeight;
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
function disableScaling(event: MouseEvent | TouchEvent): void {
  const touchEvent = (environment.touchDevice && event instanceof TouchEvent);
  document.removeEventListener((!touchEvent) ? "mousemove" : "touchmove",setScaling);
  document.removeEventListener((!touchEvent) ? "mouseup" : "touchend",disableScaling);
  document.body.removeAttribute("data-scaling-change");
}