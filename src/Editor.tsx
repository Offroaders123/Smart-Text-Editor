import { createEffect } from "solid-js";

export function Editor(props: {
  getValue: () => string,
  setValue: (value: string) => void,
}) {
  let ref: HTMLTextAreaElement;

  createEffect(() => {
    ref!.value = props.getValue();
  });

  return (
    <textarea
      ref={ref!}
      on:input={event => {
        props.setValue(event.currentTarget.value)
      }}
    />
  );
}
