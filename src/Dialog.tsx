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

  createEffect(() => {
    const external: DialogID | null = props.getActiveDialog();
    const internal: boolean = active();

    // If external changed and internal is wrong, update internal
    if (external === props.id && !internal) {
      setActive(true);
    } else if (external !== props.id && internal) {
      setActive(false);
    }

    // If internal changed and external is wrong, update external
    // This part only runs if `setActive()` was called first
    if (internal && external !== props.id) {
      props.setActiveDialog(props.id);
    } else if (!internal && external === props.id) {
      props.setActiveDialog(null);
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