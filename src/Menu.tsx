import { createEffect, createSignal, type FlowProps } from "solid-js";
import { MenuList } from "./MenuList.tsx";
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
      <MenuList
        ref={list!}
        setIsOpen={setIsOpen}>
        {props.children}
      </MenuList>
    </div>
  );
}
