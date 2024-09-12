import Card from "./Card.js";

import type { JSX } from "solid-js";

export interface AlertProps {
  id: string;
  headingText: string;
  headingIcon: string;
  mainContent: JSX.Element[];
}

export default function Alert(props: AlertProps) {
  return (
    <Card
      id={props.id}
      type="alert"
      headingText={props.headingText}
      headingIcon={props.headingIcon}
      mainContent={props.mainContent}
    />
  );
}