import { type FlowProps } from "solid-js";
import "./Menu.css";

export function Menu(props: FlowProps<{
  title: string;
}>) {
  let opener: HTMLButtonElement;
  let list: HTMLOListElement;

  return (
    <div class="Menu">
      <button
        ref={opener!}
        on:click={() => list!.togglePopover({ source: opener! })}>
        {props.title}
      </button>
      <ol
        ref={list!}
        popover="auto">
        {props.children}
      </ol>
    </div>
  );
}
