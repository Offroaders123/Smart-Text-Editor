import CheckIcon from "./CheckIcon.js";
import "./Checkbox.scss";

import type { JSX, FlowProps } from "solid-js";

export interface CheckboxProps {
  id: string;
  checked?: boolean;
  oninput?: JSX.CustomEventHandlersLowerCase<HTMLInputElement>["oninput"];
}

export default function Checkbox(props: FlowProps<CheckboxProps, string>) {
  let input: HTMLInputElement;

  return (
    <div
      class="checkbox"
      onclick={() => input!.click()}
      onkeydown={event => {
        if (!event.repeat && event.key == "Enter") {
          input!.click();
        }
      }}
      onkeyup={event => {
        if (event.key == " ") {
          input!.click();
        }
      }}
      tabindex={0}
    >
      <input
        id={props.id}
        ref={input!}
        type="checkbox"
        oninput={props.oninput}
        onclick={event => event.stopPropagation()}
        checked={props.checked}
      />
      <label for={props.id}>
        <CheckIcon/>
        {props.children}
      </label>
    </div>
  );
}