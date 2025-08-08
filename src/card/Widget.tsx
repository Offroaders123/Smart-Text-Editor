import Card from "./Card.js";
import "./Widget.scss";

import type { JSX } from "solid-js";
import type { WidgetID } from "../app.js";

export interface WidgetProps {
  id: WidgetID;
  heading: string;
  main: JSX.Element;
  options: JSX.Element;
}

export default function Widget(props: WidgetProps) {
  return (
    <Card
      id={props.id}
      type="widget"
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}