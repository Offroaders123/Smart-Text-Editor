import { type FlowProps } from "solid-js";
import "./Menu.css";

export function Menu(props: FlowProps) {
  return (
    <div>
      {props.children}
    </div>
  );
}
