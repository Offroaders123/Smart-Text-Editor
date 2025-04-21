import Card from "./Card.js";
import "./Alert.scss";

import type { Accessor, JSX } from "solid-js";
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
}

export default function Alert(props: AlertProps) {
  return (
    <Card
      id={props.id}
      type="alert"
      active={props.getActiveAlert}
      minimize={null}
      heading={props.heading}
      icon={props.icon}
      main={props.main}
    />
  );
}