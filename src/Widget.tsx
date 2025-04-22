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
  return (
    <Card
      id={props.id}
      type="widget"
      active={() => props.getActiveWidget() === props.id}
      setActive={() => props.setActiveWidget(props.id)}
      minimize={() => props.getMinimizeWidget() === props.id}
      setMinimize={() => props.setMinimizeWidget(props.id)}
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}