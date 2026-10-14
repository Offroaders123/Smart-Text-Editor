import { type FlowProps, type Ref } from "solid-js";

export function MenuList(props: FlowProps<{
  ref: Ref<HTMLOListElement>;
  setIsOpen: (value: boolean) => void;
}>) {
  return (
    <ol
      ref={props.ref}
      popover="auto"
      on:toggle={event => {
        props.setIsOpen(event.newState === "open");
      }}>
      {props.children}
    </ol>
  );
}
