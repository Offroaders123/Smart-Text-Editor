import { createEffect, createMemo } from "solid-js";
// import Card from "./Card.js";
import BackIcon from "./BackIcon.js";
import CloseIcon from "./CloseIcon.js";
import { getElementStyle } from "./dom.js";
import { catchCardNavigation, getNavigableElements } from "./dialog-navigation.js";
import "./Card.scss";
import "./Dialog.scss";

import type { Accessor, JSX, Setter } from "solid-js";
import type { CardID, DialogID } from "./app.js";

export interface CardElement extends HTMLDivElement {
  id: CardID;
}

export type CardType = "alert" | "widget" | "dialog";

export interface CardControls {
  readonly minimize: HTMLButtonElement;
  readonly close: HTMLButtonElement;
}

export interface DialogProps {
  id: DialogID;
  parent?: DialogID;
  heading: string;
  main: JSX.Element;
  options?: JSX.Element;
  getActiveDialog: Accessor<DialogID | null>;
  setActiveDialog: Setter<DialogID | null>;
}

export default function Dialog(props: DialogProps) {
  let card: CardElement;
  let header: HTMLDivElement;
  const active = createMemo<"" | null>(() => props.getActiveDialog() === props.id ? "" : null);

  createEffect(() => {
    if (active() === "") {
      document.body.addEventListener("keydown", catchCardNavigation);
    for (const menu of document.querySelectorAll<MenuDropElement>("menu-drop[data-open]")) {
      menu.close();
    }
    } else {
      document.body.removeEventListener("keydown", catchCardNavigation);
    }
  });

  return (
    <div
      id={props.id}
      class="Card"
      data-type="dialog"
      data-active={active()}
      ref={card!}
      onkeydown={event => {
        if (card!.getAttribute("data-type") != "dialog" || event.key != "Tab") return;
        const navigable = getNavigableElements({ container: card!, scope: true });
        if (!event.shiftKey){
          if (document.activeElement != navigable[navigable.length - 1]) return;
          event.preventDefault();
          navigable[0]?.focus();
        } else if (document.activeElement == navigable[0]){
          event.preventDefault();
          navigable[navigable.length - 1]?.focus();
        }
      }}>
      <div class="header" data-card-parent={props.parent} ref={header!}>
        <button class="card-back" onclick={() => {
          props.setActiveDialog(props.parent!);

          const previous: string = card!.id;
          const transitionDuration = parseInt(`${Number(getElementStyle({ element: card!, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
          window.setTimeout(() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            if (previous) document.querySelector<HTMLElement>(`#${props.parent!} [data-card-previous="${previous}"]`)!.focus();
          },transitionDuration);
        }}>
          <BackIcon/>
        </button>
        <span class="heading">{props.heading}</span>
        <div class="card-controls">
          <button class="control" data-control="close" onclick={() => props.setActiveDialog(null)}>
            <CloseIcon/>
          </button>
        </div>
      </div>
      <div class="main">
        <div class="content">
          {props.main}
        </div>
        {props.options}
      </div>
    </div>
  );
}