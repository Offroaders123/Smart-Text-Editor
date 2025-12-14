import { setActiveWidget } from "../app.js";
import ArrowIcon from "../icon/ArrowIcon.js";
import MinimizeIcon from "../icon/MinimizeIcon.js";
import CloseIcon from "../icon/CloseIcon.js";
import { getElementStyle } from "../dom.js";
import "./Card.scss";

import type { JSX } from "solid-js";
import type { CardID, WidgetID } from "../app.js";

export type CardType = "widget";

export interface CardControls {
  readonly minimize: HTMLButtonElement;
  readonly close: HTMLButtonElement;
}

export interface CardProps {
  id: CardID;
  type: CardType;
  active?: boolean;
  heading: string;
  icon?: string;
  main: JSX.Element;
  options?: JSX.Element;
}

/**
 * The base component for the Alert, Dialog, and Widget card types.
*/
export default function Card(props: CardProps) {
  let card: HTMLDivElement & { id: CardID; };
  let header: HTMLDivElement;

  return (
    <div
      id={props.id}
      class="Card"
      data-type={props.type}
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
      <div class="header" ref={header!}>
        <span class="heading">{props.heading}</span>
        <div class="card-controls">
          <button class="control" data-control="minimize" onkeydown={event => {
            if (event.key != "Enter") return;
            event.preventDefault();
            if (event.repeat) return;
            event.currentTarget.click();
          }} onclick={() => minimizeCard(card!.id)}>
            <MinimizeIcon/>
          </button>
          <button class="control" data-control="close" onclick={() => closeCard(card!.id)}>
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

  export function openCard(id: CardID): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    if (self.matches("[data-active]") && !self.hasAttribute("data-alert-timeout")) return closeCard(id);
      document.querySelectorAll<HTMLDivElement>(`.Card[data-active]`).forEach(card => {
        closeCard(card.id as CardID);
        if (!card.matches(".minimize")) return;
        const transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
        window.setTimeout(() => minimizeCard(card.id as CardID),transitionDuration);
      });
    self.setAttribute("data-active","");
    setActiveWidget(self.id as WidgetID);
  }

  export function minimizeCard(id: CardID): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    const icon = getCardControls(self).minimize.querySelector("svg")!;
    const main = self.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    self.setAttribute("data-minimize-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    if (!self.matches(".minimize")){
      self.classList.add("minimize");
      if (getCardControls(self) === undefined) return;
      self.style.setProperty("--card-minimize-width",`${getCardControls(self).minimize.querySelector("svg")!.clientWidth + parseInt(getElementStyle({ element: getCardControls(self).minimize, property: "--control-padding" }),10) * 2}px`);
      self.style.setProperty("--card-main-width",`${main.clientWidth}px`);
      self.style.setProperty("--card-main-height",`${main.clientHeight}px`);
      icon.replaceWith(ArrowIcon() as Element);
      if (self.contains(document.activeElement) && document.activeElement != getCardControls(self).minimize) getCardControls(self).minimize.focus();
    } else {
      self.classList.remove("minimize");
      window.setTimeout(() => {
        if (self.getAttribute("data-minimize-change") == changeIdentifier) self.style.removeProperty("--card-minimize-width");
      },transitionDuration);
      self.style.removeProperty("--card-main-width");
      self.style.removeProperty("--card-main-height");
      icon.replaceWith(MinimizeIcon() as Element);
    }
    window.setTimeout(() => {
      if (self.getAttribute("data-minimize-change") == changeIdentifier) self.removeAttribute("data-minimize-change");
    },transitionDuration);
  }

  export function closeCard(id: CardID): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    self.removeAttribute("data-active");
    if (self.matches(".minimize")){
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => minimizeCard(id),transitionDuration);
    }
    setActiveWidget(null);
  }

  /**
   * Gets all navigable elements within a given parent element.
   * 
   * @param options If the scope option is set to `true`, only direct children within the parent element will be selected.
  */
  function getNavigableElements({ container, scope = false }: GetNavigableElementsOptions): HTMLElement[] {
    scope = (scope) ? "" : ":scope > ";
    const navigable: NodeListOf<HTMLElement> = container.querySelectorAll(`${scope}button:not([disabled]), ${scope}textarea:not([disabled]), ${scope}input:not([disabled]), ${scope}select:not([disabled]), ${scope}a[href]:not([disabled]), ${scope}[tabindex]:not([tabindex="-1"])`);
    return Array.from(navigable).filter(element => (getElementStyle({ element, property: "display" }) != "none"));
  }

  function getCardControls(self: HTMLDivElement): CardControls {
    const controls: HTMLButtonElement[] = [...self.querySelectorAll<HTMLButtonElement>(".card-controls .control")];
    const [minimize, close] = controls as [HTMLButtonElement, HTMLButtonElement];
    return { minimize, close };
  }

export interface GetNavigableElementsOptions {
  container: HTMLElement;
  scope?: boolean | string;
}