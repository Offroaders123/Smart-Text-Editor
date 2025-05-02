import { createMemo } from "solid-js";
import Card from "./Card.js";
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
  const active = createMemo<boolean>(() => props.getActiveDialog() === props.id);
  const setActive = createMemo<DialogID | null>(isActive => props.setActiveDialog(isActive ? props.id : null));

  return (
    <Card
      id={props.id}
      type="dialog"
      active={active}
      setActive={setActive}
      parent={props.parent}
      heading={props.heading}
      main={props.main}
      options={props.options}
    />
  );
}