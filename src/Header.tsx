import { Match, Switch } from "solid-js";
import { Menu } from "./Menu.tsx";
import { MenuItem } from "./MenuItem.tsx";

export function Header(props: {
  hasEditor: () => boolean,
}) {
  return (
    <header>
      <Menu title="File">
        <MenuItem accelerator="Meta+N">New File</MenuItem>
        <MenuItem accelerator="Meta+O">Open...</MenuItem>
        <MenuItem accelerator="Meta+S">Save</MenuItem>
        <MenuItem accelerator="Meta+Shift+S">Save As...</MenuItem>
        <Switch>
          <Match when={props.hasEditor()}>
            <MenuItem accelerator="Meta+W">Close Editor</MenuItem>
          </Match>
          <Match when={props.hasEditor() === false}>
            <MenuItem accelerator="Meta+W">Close Window</MenuItem>
          </Match>
        </Switch>
      </Menu>
    </header>
  );
}
