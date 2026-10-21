import { createContext, useContext, type FlowProps, type Ref } from "solid-js";
import { useMenu } from "./Menu.tsx";
import "./MenuList.css";

interface MenuListContextValue {
  isOpen: () => boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MenuListContext = createContext<MenuListContextValue>();

export function useMenuList(): MenuListContextValue {
  const value: MenuListContextValue | undefined = useContext(MenuListContext);

  if (!value) {
    throw new Error("Can't find MenuListContext");
  }

  return value;
}

export function MenuList(props: FlowProps<{
  ref: Ref<HTMLOListElement>;
}>) {
  const menu = useMenu();

  return (
    <ol
      ref={props.ref}
      class="MenuList"
      popover="auto"
      on:toggle={event => {
        if (event.newState === "open") {
          menu.open();
        } else {
          menu.close();
        }
      }}>
      {props.children}
    </ol>
  );
}
