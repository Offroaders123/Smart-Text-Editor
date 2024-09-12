import Card from "./Card.js";
import "./Alert.scss";

import type { JSX } from "solid-js";

export interface AlertProps {
  id: string;
  heading: string;
  icon: string;
  main: JSX.Element;
}

export default function Alert(props: AlertProps) {
  return (
    <Card
      id={props.id}
      type="alert"
      heading={props.heading}
      icon={props.icon}
      main={props.main}
    />
  );
}