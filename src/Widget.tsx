import Card from "./Card.js";
import "./Widget.scss";

import type { JSX } from "solid-js";

export interface WidgetProps {
  id: string;
  heading: string;
  main: JSX.Element[];
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