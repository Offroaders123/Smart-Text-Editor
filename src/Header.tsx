import { Match, Switch } from "solid-js";
import { Menu } from "./menu/Menu.tsx";
import { MenuOpener } from "./menu/MenuOpener.tsx";

export function Header(props: {
  hasEditor: () => boolean;
}) {
  return (
    <header>
      <Menu>
        <MenuOpener>File</MenuOpener>
        <ul>
          <li data-accelerator="Cmd+N">
            <button>New File</button>
          </li>
          <li data-accelerator="Cmd+O">
            <button>Open...</button>
          </li>
          <li data-accelerator="Cmd+S">
            <button>Save</button>
          </li>
          <li data-accelerator="Cmd+Shift+S">
            <button>Save As...</button>
            <ul>
              <li>
                <button>Plain Text</button>
              </li>
              <li>
                <button>JavaScript</button>
              </li>
              <li>
                <button>TypeScript</button>
              </li>
              <li>
                <button>Markdown</button>
              </li>
              <li>
                <button>Rust</button>
              </li>
            </ul>
          </li>
          <Switch>
            <Match when={props.hasEditor()}>
              <li data-accelerator="Cmd+W">
                <button>Close Editor</button>
              </li>
            </Match>
            <Match when={props.hasEditor() === false}>
              <li data-accelerator="Cmd+W">
                <button>Close Window</button>
              </li>
            </Match>
          </Switch>
        </ul>
      </Menu>
    </header>
  );
}
