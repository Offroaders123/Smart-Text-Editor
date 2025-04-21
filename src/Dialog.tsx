import Card from "./Card.js";
import "./Dialog.scss";

import type { Accessor, JSX } from "solid-js";
import type { DialogID } from "./app.js";

export interface DialogProps {
  id: DialogID;
  parent?: string;
  heading: string;
  main: JSX.Element;
  options?: JSX.Element;
  getActiveDialog: Accessor<DialogID | null>;
}

export default function Dialog(props: DialogProps) {
  return (
    <Card
      id={props.id}
      type="dialog"
      active={() => props.getActiveDialog() === props.id}
      minimize={null}
      parent={props.parent}
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}