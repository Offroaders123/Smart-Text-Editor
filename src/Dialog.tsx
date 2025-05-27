import { createMemo } from "solid-js";
// import Card from "./Card.js";
import "./Card.scss";
import "./Dialog.scss";

import type { Accessor, JSX, Setter } from "solid-js";
import type { DialogID } from "./app.js";

export interface DialogProps {
  id: DialogID;
  parent?: DialogID;
  heading: string;
  main: JSX.Element;
  options?: JSX.Element;
  getActiveDialog: Accessor<DialogID | null>;
  setActiveDialog: Setter<DialogID | null>;
}

export default function Dialog(props: DialogProps) {
  const active = createMemo<"" | null>(() => props.getActiveDialog() === props.id ? "" : null);

  return (
    <div
      id={props.id}
      data-type="dialog"
      data-active={active()}
    />
  );
}