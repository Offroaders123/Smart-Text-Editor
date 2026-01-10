import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { createEffect } from "solid-js";

import type { Accessor, ComponentProps } from "solid-js";

export interface NumTextProps extends Pick<ComponentProps<"textarea">, "class" | "placeholder"> {
  ref?: ComponentProps<"div">["ref"];
  view?: (view: EditorView) => void;
  value?: Accessor<string>;
  setValue?: (value: string) => void;
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
    extensions: [
      basicSetup,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          props.setValue?.(update.state.doc.toString());
        }
      })
    ]
  });

  props.view?.(view);

  createEffect(() => {
    if (!props.value) return;
    replaceEditorViewValue(view, props.value());
  });

  return ref;
}

export function replaceEditorViewValue(view: EditorView, value: string): void {
  if (view.state.doc.toString() === value) return;

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: value
    },
    selection: { anchor: 0 },
    scrollIntoView: true
  });
}