import { type Ref } from "solid-js";
import "./MenuOpener.css";

export function MenuOpener(props: {
  ref: Ref<HTMLButtonElement>;
  toggleIsOpen: () => void;
  title: string;
}) {
  return (
    <button
      ref={props.ref}
      class="MenuOpener"
      on:click={props.toggleIsOpen}>
      {props.title}
    </button>
  );
}
