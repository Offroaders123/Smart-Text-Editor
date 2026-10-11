import { type FlowProps } from "solid-js";
import "./Menu.css";

export function Menu(props: FlowProps<{
  id: string;
  title: string;
}>) {
  return (
    <div id={props.id}>
      <button
        id={`${props.id}-button`}
        popovertarget={`${props.id}-list`}>
        {props.title}
      </button>
      <ol
        id={`${props.id}-list`}
        class="MenuList"
        popover="auto">
        {props.children}
      </ol>
    </div>
  );
}
