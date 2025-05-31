import { createEffect, createMemo, createSignal } from "solid-js";
// import Card from "./Card.js";
import DecorativeImage from "./DecorativeImage.js";
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
  const [getAlertTimeout, setAlertTimeout] = createSignal<string | null>(null);
  const active = createMemo<"" | null>(() => props.getActiveAlert() ? "" : null);

  createEffect(() => {
    if (active() === null) return;
    const timeoutIdentifier = Math.random().toString();
    setAlertTimeout(timeoutIdentifier);
    setTimeout(() => {
      if (getAlertTimeout() != timeoutIdentifier) return;
      setAlertTimeout(null);
      props.setActiveAlert(false);
      console.log("closed!", timeoutIdentifier);
    }, 4000);
  });

  return (
    <div
      id={props.id}
      class="Card"
      data-type="alert"
      data-active={active()}>
      <div class="header">
        <DecorativeImage class="icon" src={props.icon!} alt=""/>
        <span class="heading">{props.heading}</span>
      </div>
      <div class="main">
        <div class="content">
          {props.main}
        </div>
      </div>
    </div>
  );
}