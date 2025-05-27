import { createMemo } from "solid-js";
// import Card from "./Card.js";
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
  const active = createMemo<"" | null>(() => props.getActiveWidget() === props.id ? "" : null);

  return (
    <div
      id={props.id}
      class="Card"
      data-type="widget"
      data-active={active()}
    />
  );
}