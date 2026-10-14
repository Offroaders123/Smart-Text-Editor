import { createEffect, createSignal, type FlowProps } from "solid-js";
import "./Menu.css";

export function Menu(props: FlowProps<{
  title: string;
}>) {
  let opener: HTMLButtonElement;
  let list: HTMLOListElement;

  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const toggleIsOpen = (): boolean => setIsOpen(prev => !prev);

  createEffect(() => {
    console.log(isOpen());

    if (isOpen()) {
      list!.showPopover({ source: opener! });
    } else {
      list!.hidePopover();
    }
  });

  return (
    <div class="Menu">
      <button
        ref={opener!}
        on:click={toggleIsOpen}>
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
