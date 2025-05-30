import { createEffect, createMemo, createSignal } from "solid-js";
// import Card from "./Card.js";
import MinimizeIcon from "./MinimizeIcon.js";
import CloseIcon from "./CloseIcon.js";
import { setMinimizeChangeGLOBAL, setMinimizeHandler } from "./app.js";
import { getElementStyle } from "./dom.js";
import "./Card.scss";
import "./Widget.scss";

import type { JSX } from "solid-js";
import type { activeWidget, minimizeHandler, setActiveWidget, WidgetID } from "./app.js";

export interface WidgetProps {
  id: WidgetID;
  heading: string;
  main: JSX.Element;
  options: JSX.Element;
  getActiveWidget: typeof activeWidget;
  setActiveWidget: typeof setActiveWidget;
  getMinimizeHandler: typeof minimizeHandler;
  setMinimizeHandler: typeof setMinimizeHandler;
}

export default function Widget(props: WidgetProps) {
  let self: HTMLDivElement;
  let header: HTMLDivElement;
  const active = createMemo<"" | null>(() => props.getActiveWidget() === props.id ? "" : null);
  const [minimize, setMinimize] = createSignal<boolean>(false);
  const [minimizeChange, setMinimizeChange] = createSignal<string | null>(null);
  const getMinimize = createMemo<"" | null>(() => minimize() ? "" : null);

  createEffect<WidgetID | null>(previous => {
    if (active() === "") {
      setMinimizeHandler([
        minimize,
        setMinimize
      ]);
      console.log(`set handler: ${props.id}\nprevious: ${previous}`);
    } else if (previous === props.id && props.getActiveWidget() === null) {
      setMinimizeHandler(null);
      console.log(`unset handler: ${props.id}\nprevious: ${previous}`);
    }

    return props.getActiveWidget();
  }, props.getActiveWidget());

  createEffect(() => {
    const changeIdentifier = Math.random().toString();

    setMinimizeChange(changeIdentifier);
    setMinimizeChangeGLOBAL(changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: self!, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);

    if (minimize()) {
      console.log(`${props.id}: MINIED`);
    } else {
      console.log(`${props.id}: maxed`);
    }
  });

  createEffect(() => {
    if (active() !== null || !minimize()) return;
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: self!, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    setTimeout(() => {
      setMinimize(false);
      console.log("maximized automatically!");
    }, transitionDuration);
  });

  return (
    <div
      id={props.id}
      class="Card"
      data-type="widget"
      data-active={active()}
      data-minimize={getMinimize()}
      data-minimize-change={minimizeChange()}
      ref={self!}>
      <div class="header" ref={header!}>
        <span class="heading">{props.heading}</span>
        <div class="card-controls">
          <button class="control" data-control="minimize" onkeydown={event => {
            if (event.key != "Enter") return;
            event.preventDefault();
            if (event.repeat) return;
            event.currentTarget.click();
          }} onclick={() => setMinimize!(!minimize!())}>
            <MinimizeIcon/>
          </button>
          <button class="control" data-control="close" onclick={() => props.setActiveWidget(null)}>
            <CloseIcon/>
          </button>
        </div>
      </div>
      <div class="main">
        <div class="content">
          {props.main}
        </div>
        {props.options}
      </div>
    </div>
  );
}