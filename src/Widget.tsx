import Card from "./Card.js";
import "./Widget.scss";

import type { JSX } from "solid-js";

export interface WidgetProps {
  id: string;
  headingText: string;
  mainContent: JSX.Element[];
  options: JSX.Element[];
}

export default function Widget(props: WidgetProps) {
  return (
    <Card
      id={props.id}
      type="widget"
      headingText={props.headingText}
      mainContent={props.mainContent}
      options={props.options}
    />
  );
}