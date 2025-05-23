import { createEffect, createMemo, createSignal } from "solid-js";
import Card from "./Card.js";
import "./Widget.scss";

import type { Accessor, JSX, Setter } from "solid-js";
import type { WidgetID } from "./app.js";

export interface WidgetProps {
  id: WidgetID;
  heading: string;
  main: JSX.Element;
  options: JSX.Element;
  getActiveWidget: Accessor<WidgetID | null>;
  setActiveWidget: Setter<WidgetID | null>;
  getMinimizeWidget: Accessor<WidgetID | null>;
  setMinimizeWidget: Setter<WidgetID | null>;
}

export default function Widget(props: WidgetProps) {
  createEffect(() => {
    console.log(props.getActiveWidget(), props.getMinimizeWidget());
  });

  const active = createMemo<boolean>(() => props.getActiveWidget() === props.id);
  const [active_, setActive] = createSignal<boolean>(props.getActiveWidget() === props.id);

  createEffect(() => {
    if (active_()) {
      props.setActiveWidget(props.id);
    } else {
      props.setActiveWidget(null);
    }
  });

  return (
    <Card
      id={props.id}
      type="widget"
      active={active}
      setActive={setActive}
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}