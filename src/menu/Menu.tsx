import { createContext, createEffect, createSignal, useContext, type FlowProps } from "solid-js";
import "./Menu.css";
import { MenuList } from "./MenuList.tsx";
import { MenuOpener } from "./MenuOpener.tsx";

interface MenuContextValue {
  isOpen: () => boolean;
  setIsOpen: (value: boolean) => void;
  toggleIsOpen: () => boolean;
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
  const toggleIsOpen = () => setIsOpen(prev => !prev);

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
        value={{ isOpen, setIsOpen, toggleIsOpen }}>
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
