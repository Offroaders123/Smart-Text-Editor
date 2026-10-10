import { Match, Switch } from "solid-js";
import { Menu } from "./Menu.tsx";
import { MenuItem } from "./MenuItem.tsx";

export function Header(props: {
  hasEditor: () => boolean,
}) {
  return (
    <header>
      <Menu title="File">
        <MenuItem accelerator="Cmd+N">New File</MenuItem>
        <MenuItem accelerator="Cmd+O">Open...</MenuItem>
        <MenuItem accelerator="Cmd+S">Save</MenuItem>
        <MenuItem accelerator="Cmd+Shift+S">Save As...</MenuItem>
        <Switch>
          <Match when={props.hasEditor()}>
            <MenuItem accelerator="Cmd+W">Close Editor</MenuItem>
          </Match>
          <Match when={props.hasEditor() === false}>
            <MenuItem accelerator="Cmd+W">Close Window</MenuItem>
          </Match>
        </Switch>
      </Menu>
    </header>
  );
}
