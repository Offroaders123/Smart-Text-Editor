import { type Accessor, For, createMemo, createEffect } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import { render } from "solid-js/web";

type EditorID = `editor_${number}`;

interface Editor {
  id: EditorID;
  name: string;
  value: string;
}

interface EditorList {
  [id: EditorID]: Editor;
}

interface CreateEditorProps {
  createEditor: () => void;
}

function CreateEditor(props: CreateEditorProps) {
  return (
    <button onClick={() => props.createEditor()}>
      Create Editor
    </button>
  );
}

interface EditorRenderProps {
  editor: Editor;
  setEditors: SetStoreFunction<EditorList>;
  closeEditor: (id: EditorID) => void;
}

function EditorRender(props: EditorRenderProps) {
  return (
    <div class="EditorRender" style={{ display: "flex" }}>
      <button>{props.editor.name}</button>
      <button onClick={() => props.closeEditor(props.editor.id)}>X</button>
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

  function createEditor(): void {
    const i: number = Object.keys(editors).length + 1;
    const id: EditorID = `editor_${i}`;

    setEditors(id, {
      id,
      name: `Untitled${i}.txt`,
      value: "Hello world!"
    });
  }

  function closeEditor(id: EditorID): void {
    setEditors(id, undefined!);
  }

  const values: Accessor<Editor[]> = createMemo(() =>
    (Object.keys(editors) as Editor["id"][]).map(id => editors[id])
  );

  createEffect(() => {
    console.log(JSON.stringify(editors, null, 2));
  });

  return (
    <>
      <CreateEditor createEditor={createEditor}/>
      <For
        each={values()}>
        {editor => <EditorRender
          editor={editor}
          setEditors={setEditors}
          closeEditor={closeEditor}
        />}
      </For>
      <JSONRender editors={values}/>
    </>
  );
}

render(() => <App/>, document.getElementById("app")!);
