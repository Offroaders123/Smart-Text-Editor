import Card from "./Card.js";
import "./Dialog.scss";

import type { JSX } from "solid-js";

export interface DialogProps {
  id: string;
  parent?: string;
  heading: string;
  main: JSX.Element[];
  options?: JSX.Element[];
}

export default function Dialog(props: DialogProps) {
  return (
    <Card
      id={props.id}
      type="dialog"
      parent={props.parent}
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}