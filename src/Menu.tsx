import { type FlowProps } from "solid-js";
import "./Menu.css";

export function Menu(props: FlowProps<{
  title: string;
}>) {
  let opener: HTMLButtonElement;
  let list: HTMLOListElement;

  function toggleList(): void {
    list!.togglePopover({ source: opener! });
  }

  return (
    <div class="Menu">
      <button
        ref={opener!}
        on:click={toggleList}>
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
