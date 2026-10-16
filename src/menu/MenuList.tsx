import { type FlowProps, type Ref } from "solid-js";
import { useMenu } from "./Menu.tsx";
import "./MenuList.css";

export function MenuList(props: FlowProps<{
  ref: Ref<HTMLOListElement>;
}>) {
  const menu = useMenu();

  return (
    <ol
      ref={props.ref}
      class="MenuList"
      popover="auto"
      on:toggle={event => {
        if (event.newState === "open") {
          menu.open();
        } else {
          menu.close();
        }
      }}>
      {props.children}
    </ol>
  );
}
