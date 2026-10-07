import { createSignal } from "solid-js";
import { Editor } from "./Editor.tsx";
import { Header } from "./Header.tsx";
import { Preview } from "./Preview.tsx";

export default function App() {
  const [getValue, setValue] = createSignal<string>("");

  return (
    <>
      <Header />
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
