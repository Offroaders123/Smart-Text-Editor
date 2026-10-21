import { type FlowProps } from "solid-js";
import "./MenuOpener.css";

export function MenuOpener(props: FlowProps) {
  return (
    <button>
      {props.children}
    </button>
  );
}
