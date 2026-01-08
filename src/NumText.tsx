import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";

import type { Accessor, ComponentProps } from "solid-js";

export interface NumTextProps extends Pick<ComponentProps<"textarea">, "ref" | "class" | "placeholder" | "oninput"> {
  value?: Accessor<string>;
}

export default function NumText(props: NumTextProps) {
  const ref: HTMLElement = <div></div> as HTMLElement;

  const view = new EditorView({
    doc: "Template content, just to test real quick!",
    parent: ref,
    extensions: [basicSetup]
  });

  return ref;
}