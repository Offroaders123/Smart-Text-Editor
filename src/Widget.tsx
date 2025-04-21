import Card from "./Card.js";
import "./Widget.scss";

import type { Accessor, JSX } from "solid-js";
import type { WidgetID } from "./app.js";

export interface WidgetProps {
  id: WidgetID;
  heading: string;
  main: JSX.Element;
  options: JSX.Element;
  getActiveWidget: Accessor<WidgetID | null>;
  getMinimizeWidget: Accessor<WidgetID | null>;
}

export default function Widget(props: WidgetProps) {
  return (
    <Card
      id={props.id}
      type="widget"
      active={() => props.getActiveWidget() === props.id}
      minimize={() => props.getMinimizeWidget() === props.id}
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}