import { createEffect } from "solid-js";
import { view } from "./STE.js";
import { disableScaling, setScaling } from "./Workspace.js";

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