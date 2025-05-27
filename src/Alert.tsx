import { createMemo } from "solid-js";
// import Card from "./Card.js";
import "./Card.scss";
import "./Alert.scss";

import type { Accessor, JSX, Setter } from "solid-js";
import type { AlertID } from "./app.js";

export interface AlertProps {
  id: AlertID;
  heading: string;
  icon: string;
  main: JSX.Element;
  /**
   * (Shim?)
   * This should probably be data-driven with a single `Set<AlertID>` somehow.
   * @deprecated
   */
  getActiveAlert: Accessor<boolean>;
  /**
   * (Shim?)
   * This should probably be data-driven with a single `Set<AlertID>` somehow.
   * @deprecated
   */
  setActiveAlert: Setter<boolean>;
}

export default function Alert(props: AlertProps) {
  const active = createMemo<"" | null>(() => props.getActiveAlert() ? "" : null);

  return (
    <div
      id={props.id}
      data-type="alert"
      data-active={active()}
    />
  );
}