import { type Ref } from "solid-js";

export function MenuOpener(props: {
  ref: Ref<HTMLButtonElement>;
  toggleIsOpen: () => void;
  title: string;
}) {
  return (
    <button
      ref={props.ref}
      on:click={props.toggleIsOpen}>
      {props.title}
    </button>
  );
}
