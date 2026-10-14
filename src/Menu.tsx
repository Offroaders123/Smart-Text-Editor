import { createEffect, createSignal, type FlowProps } from "solid-js";
import "./Menu.css";
import { MenuOpener } from "./MenuOpener.tsx";

export function Menu(props: FlowProps<{
  title: string;
}>) {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  let opener: HTMLButtonElement;
  let list: HTMLOListElement;

  createEffect(() => {
    console.log(isOpen());
  });

  function toggleIsOpen(): void {
    if (isOpen()) {
      list!.hidePopover();
    } else {
      list!.showPopover({ source: opener! });
    }
  }

  return (
    <div class="Menu">
      <MenuOpener
        ref={opener!}
        toggleIsOpen={toggleIsOpen}
        title={props.title}
      />
      <ol
        ref={list!}
        popover="auto"
        on:toggle={event => {
          setIsOpen(event.newState === "open");
        }}>
        {props.children}
      </ol>
    </div>
  );
}
