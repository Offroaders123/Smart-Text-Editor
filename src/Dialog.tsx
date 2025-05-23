import { createEffect, createSignal } from "solid-js";
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
  const [active, setActive] = createSignal<boolean>(props.getActiveDialog() === props.id);

  // Keep `active()` in sync when parent changes `getActiveDialog`
  createEffect(() => {
    const isActive: boolean = props.getActiveDialog() === props.id;
    if (active() !== isActive) {
      setActive(isActive);
    }
  });

  // Keep parent in sync when `active()` changes locally
  createEffect(() => {
    if (active()) {
      if (props.getActiveDialog() !== props.id) {
        props.setActiveDialog(props.id);
      }
    } else {
      if (props.getActiveDialog() === props.id) {
        props.setActiveDialog(null);
      }
    }
  });

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