import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";

import type { Accessor, ComponentProps } from "solid-js";

export interface NumTextProps extends Pick<ComponentProps<"textarea">, "class" | "placeholder" | "oninput"> {
  ref?: ComponentProps<"div">["ref"];
  value?: Accessor<string>;
}

export default function NumText(props: NumTextProps) {
  const ref: HTMLElement = (
    <div
      ref={props.ref}
      class={`NumText ${props.class}`}
    />
  ) as HTMLElement;

  const view = new EditorView({
    doc: props.value?.(),
    parent: ref,
    extensions: [basicSetup]
  });

  return ref;
}