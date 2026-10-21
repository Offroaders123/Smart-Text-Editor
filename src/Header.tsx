import { Match, Switch } from "solid-js";

export function Header(props: {
  hasEditor: () => boolean;
}) {
  return (
    <header>
      <ul>
        <li>File
          <ul>
            <li data-accelerator="Cmd+N">New File</li>
            <li data-accelerator="Cmd+O">Open...</li>
            <li data-accelerator="Cmd+S">Save</li>
            <li data-accelerator="Cmd+Shift+S">Save As...
              <ul>
                <li>Plain Text</li>
                <li>JavaScript</li>
                <li>TypeScript</li>
                <li>Markdown</li>
                <li>Rust</li>
              </ul>
            </li>
            <Switch>
              <Match when={props.hasEditor()}>
                <li data-accelerator="Cmd+W">Close Editor</li>
              </Match>
              <Match when={props.hasEditor() === false}>
                <li data-accelerator="Cmd+W">Close Window</li>
              </Match>
            </Switch>
          </ul>
        </li>
      </ul>
    </header>
  );
}
