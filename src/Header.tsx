import { Match, Switch } from "solid-js";
import { Menu } from "./menu/Menu.tsx";
import { MenuItem } from "./menu/MenuItem.tsx";
import { MenuOpener } from "./menu/MenuOpener.tsx";

export function Header(props: {
  hasEditor: () => boolean;
}) {
  return (
    <header>
      <Menu>
        <MenuOpener>File</MenuOpener>
        <ul>
          <MenuItem accelerator="Cmd+N">New File</MenuItem>
          <MenuItem accelerator="Cmd+O">Open...</MenuItem>
          <MenuItem accelerator="Cmd+S">Save</MenuItem>
          <MenuItem accelerator="Cmd+Shift+S">
            <button>Save As...</button>
            <ul>
              <MenuItem>Plain Text</MenuItem>
              <MenuItem>JavaScript</MenuItem>
              <MenuItem>TypeScript</MenuItem>
              <MenuItem>Markdown</MenuItem>
              <MenuItem>Rust</MenuItem>
            </ul>
          </MenuItem>
          <Switch>
            <Match when={props.hasEditor()}>
              <MenuItem accelerator="Cmd+W">Close Editor</MenuItem>
            </Match>
            <Match when={props.hasEditor() === false}>
              <MenuItem accelerator="Cmd+W">Close Window</MenuItem>
            </Match>
          </Switch>
        </ul>
      </Menu>
    </header>
  );
}
