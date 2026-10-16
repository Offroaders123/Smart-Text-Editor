import { createContext, createEffect, createSignal, useContext, type FlowProps } from "solid-js";
import "./Menu.css";
import { MenuList } from "./MenuList.tsx";
import { MenuOpener } from "./MenuOpener.tsx";

interface MenuContextValue {
  isOpen: () => boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MenuContext = createContext<MenuContextValue>();

export function useMenu(): MenuContextValue {
  const value: MenuContextValue | undefined = useContext(MenuContext);

  if (!value) {
    throw new Error("Can't find MenuContext");
  }

  return value;
}

export function Menu(props: FlowProps<{
  title: string;
}>) {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const open = (): void => void setIsOpen(true);
  const close = (): void => void setIsOpen(false);
  const toggle = (): void => void setIsOpen(prev => !prev);

  let opener: HTMLButtonElement;
  let list: HTMLOListElement;

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
      <MenuContext.Provider
        value={{ isOpen, open, close, toggle }}>
        <MenuOpener
          ref={opener!}
          title={props.title}
        />
        <MenuList
          ref={list!}>
          {props.children}
        </MenuList>
      </MenuContext.Provider>
    </div>
  );
}
