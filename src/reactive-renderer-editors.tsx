import { type Accessor, For, createMemo, createEffect } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import { render } from "solid-js/web";

interface Editor {
  id: `editor_${number}`;
  name: string;
  value: string;
}

interface EditorList {
  [id: `editor_${number}`]: Editor;
}

interface EditorRenderProps {
  editor: Editor;
  setEditors: SetStoreFunction<EditorList>;
}

function EditorRender(props: EditorRenderProps) {
  return (
    <div class="EditorRender">
      <button>{props.editor.name}</button>
      <textarea
        value={props.editor.value}
        onInput={event => props.setEditors(
          props.editor.id,
          "value",
          event.currentTarget.value
        )}
      />
    </div>
  );
}

interface JSONRenderProps {
  editors: Accessor<Editor[]>;
}

function JSONRender(props: JSONRenderProps) {
  const jsons: Accessor<string[]> = createMemo<string[]>(() =>
    props.editors()
      .map(editor => `${JSON.stringify(editor, null, 2)}\n`)
  );

  return (
    <pre>
      <code>
        <For each={jsons()}>
          {json => json}
        </For>
      </code>
    </pre>
  );
}

export function App() {
  const [editors, setEditors] = createStore<EditorList>({
    "editor_0": {
      id: "editor_0",
      name: "Untitled.txt",
      value: "empty file!"
    },
    "editor_1": {
      id: "editor_1",
      name: "Untitled2.txt",
      value: "another empty file!"
    }
  });

  const values: Accessor<Editor[]> = createMemo(() =>
    (Object.keys(editors) as Editor["id"][]).map(id => editors[id])
  );

  createEffect(() => {
    console.log(JSON.stringify(editors, null, 2));
  });

  return (
    <>
      <For
        each={values()}>
        {editor => <EditorRender
          editor={editor}
          setEditors={setEditors}
        />}
      </For>
      <JSONRender editors={values}/>
    </>
  );
}

render(() => <App/>, document.getElementById("app")!);
