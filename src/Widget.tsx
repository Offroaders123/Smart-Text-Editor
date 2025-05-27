import { createMemo, createSignal } from "solid-js";
// import Card from "./Card.js";
import MinimizeIcon from "./MinimizeIcon.js";
import CloseIcon from "./CloseIcon.js";
import "./Card.scss";
import "./Widget.scss";

import type { JSX } from "solid-js";
import type { activeWidget, minimizeWidget, setActiveWidget, setMinimizeWidget, WidgetID } from "./app.js";

export interface WidgetProps {
  id: WidgetID;
  heading: string;
  main: JSX.Element;
  options: JSX.Element;
  getActiveWidget: typeof activeWidget;
  setActiveWidget: typeof setActiveWidget;
  getMinimizeWidget: typeof minimizeWidget;
  setMinimizeWidget: typeof setMinimizeWidget;
}

export default function Widget(props: WidgetProps) {
  let header: HTMLDivElement;
  const active = createMemo<"" | null>(() => props.getActiveWidget() === props.id ? "" : null);
  const [minimize, setMinimize] = createSignal<boolean>(false);
  const [minimizeChange, setMinimizeChange] = createSignal<string | null>(null);
  const getMinimize = createMemo<"" | null>(() => minimize() ? "" : null);

  return (
    <div
      id={props.id}
      class="Card"
      data-type="widget"
      data-active={active()}
      data-minimize={getMinimize()}
      data-minimize-change={minimizeChange()}>
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