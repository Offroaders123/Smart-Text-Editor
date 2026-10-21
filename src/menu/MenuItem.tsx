import { FlowProps } from "solid-js";
import { type Accelerator } from "./accelerator.ts";
import "./MenuItem.css";

export function MenuItem(props: FlowProps<{
  accelerator?: Accelerator;
}>) {
  return (
    <li>
      <button>
        {props.children} {props.accelerator}
      </button>
    </li>
  );
}
