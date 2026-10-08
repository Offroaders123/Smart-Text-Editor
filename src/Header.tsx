import { Match, Switch } from "solid-js";

export function Header(props: {
  hasEditor: () => boolean,
}) {
  return (
    <header>
      <div>
        <button>File</button>
        <ol>
          <li accelerator="CmdOrCtrl+N">New File</li>
          <li accelerator="CmdOrCtrl+O">Open...</li>
          <li accelerator="CmdOrCtrl+S">Save</li>
          <li accelerator="Shift+CmdOrCtrl+S">Save As...</li>
          <Switch>
            <Match when={props.hasEditor()}>
              <li accelerator="CmdOrCtrl+W">Close Editor</li>
            </Match>
            <Match when={props.hasEditor() === false}>
              <li accelerator="CmdOrCtrl+W">Close Window</li>
            </Match>
          </Switch>
        </ol>
      </div>
    </header>
  );
}
