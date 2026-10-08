import { Match, Switch } from "solid-js";
import { Menu } from "./Menu.tsx";
import { MenuItem } from "./MenuItem.tsx";

export function Header(props: {
  hasEditor: () => boolean,
}) {
  return (
    <header>
      <Menu title="File">
        <MenuItem accelerator="CmdOrCtrl+N">New File</MenuItem>
        <MenuItem accelerator="CmdOrCtrl+O">Open...</MenuItem>
        <MenuItem accelerator="CmdOrCtrl+S">Save</MenuItem>
        <MenuItem accelerator="Shift+CmdOrCtrl+S">Save As...</MenuItem>
        <Switch>
          <Match when={props.hasEditor()}>
            <MenuItem accelerator="CmdOrCtrl+W">Close Editor</MenuItem>
          </Match>
          <Match when={props.hasEditor() === false}>
            <MenuItem accelerator="CmdOrCtrl+W">Close Window</MenuItem>
          </Match>
        </Switch>
      </Menu>
    </header>
  );
}
