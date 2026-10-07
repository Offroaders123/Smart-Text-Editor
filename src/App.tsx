import { createSignal } from "solid-js";
import { Editor } from "./Editor.tsx";
import { Preview } from "./Preview.tsx";

export default function App() {
  const [getValue, setValue] = createSignal<string>("");

  return (
    <>
      <Editor
        getValue={getValue}
        setValue={setValue}
      />
      <Preview
        getSrc={getValue}
      />
    </>
  );
}
