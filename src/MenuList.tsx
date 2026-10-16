import { type FlowProps, type Ref } from "solid-js";
import "./MenuList.css";

export function MenuList(props: FlowProps<{
  ref: Ref<HTMLOListElement>;
  setIsOpen: (value: boolean) => void;
}>) {
  return (
    <ol
      ref={props.ref}
      class="MenuList"
      popover="auto"
      on:toggle={event => {
        props.setIsOpen(event.newState === "open");
      }}>
      {props.children}
    </ol>
  );
}
