import { Match, Switch } from "solid-js";
import { Menu } from "./Menu.tsx";
import { MenuItem } from "./MenuItem.tsx";

export function Header(props: {
  hasEditor: () => boolean,
}) {
  return (
    <header>
      <Menu title="File">
        <MenuItem accelerator="Super+N">New File</MenuItem>
        <MenuItem accelerator="Super+O">Open...</MenuItem>
        <MenuItem accelerator="Super+S">Save</MenuItem>
        <MenuItem accelerator="Super+Shift+S">Save As...</MenuItem>
        <Switch>
          <Match when={props.hasEditor()}>
            <MenuItem accelerator="Super+W">Close Editor</MenuItem>
          </Match>
          <Match when={props.hasEditor() === false}>
            <MenuItem accelerator="Super+W">Close Window</MenuItem>
          </Match>
        </Switch>
      </Menu>
    </header>
  );
}
