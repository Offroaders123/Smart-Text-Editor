import { type FlowProps } from "solid-js";

export function MenuSubTrigger(props: FlowProps) {
  return (
    <li
      class="MenuSubTrigger">
      {props.children}
    </li>
  );
}
