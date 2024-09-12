import Card from "./Card.js";

import type { JSX } from "solid-js";

export interface DialogProps {
  id: string;
  cardParent?: string;
  headingText: string;
  mainContent: JSX.Element[];
  options?: JSX.Element[];
}

export default function Dialog(props: DialogProps) {
  return (
    <Card
      id={props.id}
      type="dialog"
      cardParent={props.cardParent}
      headingText={props.headingText}
      mainContent={props.mainContent}
      options={props.options}
    />
  );
}