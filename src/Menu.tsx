import { type FlowProps } from "solid-js";
import "./Menu.css";

export function Menu(props: FlowProps<{
  title: string;
}>) {
  let opener: HTMLButtonElement;
  let list: HTMLOListElement;

  function toggleList(): void {
    // list!.togglePopover({ source: opener! });

    console.log(isOpen());

    if (isOpen()) {
      list!.hidePopover();
    } else {
      list!.showPopover({ source: opener! });
    }
  }

  function isOpen(): boolean {
    return list!.matches(":popover-open");
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
