import { createSignal } from "solid-js";
import { Editor } from "./Editor.tsx";
import { Header } from "./Header.tsx";
import { Preview } from "./Preview.tsx";

export default function App() {
  return (
    <>
      <Header
        hasEditor={() => true}
      />
      <Workspace />
      <Preview
        getSrc={getValue}
      />
    </>
  );
}

function Workspace() {
  const [getValue, setValue] = createSignal<string>("");

  return (
    <Editor
      getValue={getValue}
      setValue={setValue}
    />
  );
}
