import type { ParentProps } from "solid-js";

export interface CardOptionsProps extends ParentProps {}

export default function CardOptions(props: CardOptionsProps) {
  return (
    <div class="options">{props.children}</div>
  );
}