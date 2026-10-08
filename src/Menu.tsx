import { type FlowProps } from "solid-js";

export function Menu(props: FlowProps<{
  title: string,
}>) {
  return (
    <div>
      <button>{props.title}</button>
      <ol>{props.children}</ol>
    </div>
  );
}
