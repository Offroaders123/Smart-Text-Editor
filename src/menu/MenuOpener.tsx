import { type Ref } from "solid-js";
import { useMenu } from "./Menu.tsx";
import "./MenuOpener.css";

export function MenuOpener(props: {
  ref: Ref<HTMLButtonElement>;
  title: string;
}) {
  const menu = useMenu();

  return (
    <button
      ref={props.ref}
      class="MenuOpener"
      on:click={menu.toggleIsOpen}>
      {props.title}
    </button>
  );
}
