import type { Accessor, ComponentProps } from "solid-js";

export interface NumTextProps extends Pick<ComponentProps<"textarea">, "ref" | "class" | "placeholder" | "oninput"> {
  value?: Accessor<string>;
}

export default function NumText(props: NumTextProps) {
  return (
    <textarea
      {...props}
      class={`NumText ${props.class}`}
      value={props.value?.()}
    />
  );
}