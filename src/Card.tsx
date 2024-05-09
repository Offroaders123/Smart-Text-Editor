import { activeDialog, dialogPrevious, setDialogPrevious, setActiveDialog, setActiveWidget, activeEditor } from "./STE.js";
import DecorativeImage from "./DecorativeImage.js";
import Editor from "./Editor.js";
import { getElementStyle } from "./dom.js";

import type { JSX } from "solid-js";

export interface AlertProps {
  id: string;
  headingText: string;
  headingIcon: string;
  mainContent: JSX.Element[];
}

export function Alert(props: AlertProps) {
  return (
    <ste-card id={props.id} type="alert">
      <div class="header">
        <DecorativeImage class="icon" src={props.headingIcon} alt=""/>
        <span class="heading">{props.headingText}</span>
      </div>
      <div class="main">
        <div class="content">
          {props.mainContent}
        </div>
      </div>
    </ste-card>
  );
}

export interface DialogProps {
  id: string;
  cardParent?: string;
  headingText: string;
  mainContent: JSX.Element[];
  options?: JSX.Element[];
}

export function Dialog(props: DialogProps) {
  return (
    <ste-card id={props.id} type="dialog">
      <div class="header" data-card-parent={props.cardParent}>
        <button class="card-back">
          <svg>
            <use href="#back_icon"/>
          </svg>
        </button>
        <span class="heading">{props.headingText}</span>
      </div>
      <div class="main">
        <div class="content">
          {props.mainContent}
        </div>
        {props.options?.map(row => <div class="options">{row}</div>)}
      </div>
    </ste-card>
  );
}

export interface WidgetProps {
  id: string;
  headingText: string;
  mainContent: JSX.Element[];
  options: JSX.Element[];
}

export function Widget(props: WidgetProps) {
  return (
    <ste-card id={props.id} type="widget">
      <div class="header">
        <span class="heading">{props.headingText}</span>
      </div>
      <div class="main">
        <div class="content">
          {props.mainContent}
        </div>
        {props.options.map(row => <div class="options">{row}</div>)}
      </div>
    </ste-card>
  );
}

export type CardType = "alert" | "widget" | "dialog";

export interface CardControls extends HTMLDivElement {
  readonly minimize: HTMLButtonElement;
  readonly close: HTMLButtonElement;
}

export type { Card };

/**
 * The base component for the Alert, Dialog, and Widget card types.
*/
class Card extends HTMLElement {
  readonly type: CardType = this.getAttribute("type") as CardType;
  readonly header: HTMLDivElement = this.querySelector<HTMLDivElement>(".header")!;
  readonly back: HTMLButtonElement | null = this.querySelector<HTMLButtonElement>(".card-back");
  readonly heading: HTMLDivElement = this.header.querySelector<HTMLDivElement>(".heading")!;
  readonly controls: CardControls = Object.assign(document.createElement("div"),{
    minimize: document.createElement("button"),
    close: document.createElement("button")
  });

  constructor() {
    super();

    this.addEventListener("keydown",event => {
      if (this.getAttribute("type") != "dialog" || event.key != "Tab") return;
      const navigable = Card.#getNavigableElements({ container: this, scope: true });
      if (!event.shiftKey){
        if (document.activeElement != navigable[navigable.length - 1]) return;
        event.preventDefault();
        navigable[0]?.focus();
      } else if (document.activeElement == navigable[0]){
        event.preventDefault();
        navigable[navigable.length - 1]?.focus();
      }
    });

    this.back?.addEventListener("click",() => document.querySelector<Card>(`#${this.header?.getAttribute("data-card-parent")}`)!.open(this));

    this.controls.classList.add("card-controls");

    this.controls.minimize.classList.add("control");
    this.controls.minimize.setAttribute("data-control","minimize");
    this.controls.minimize.innerHTML = `<svg><use href="#minimize_icon"/></svg>`;

    this.controls.minimize.addEventListener("keydown",event => {
      if (event.key != "Enter") return;
      event.preventDefault();
      if (event.repeat) return;
      this.controls?.minimize.click();
    });

    this.controls.minimize.addEventListener("click",() => this.minimize());

    this.controls.close.classList.add("control");
    this.controls.close.setAttribute("data-control","close");
    this.controls.close.innerHTML = `<svg><use href="#close_icon"/></svg>`;

    this.controls.close.addEventListener("click",() => this.close());

    this.controls.appendChild(this.controls.minimize);
    this.controls.appendChild(this.controls.close);
    this.header.appendChild(this.controls);
  }

  open(this: Card, previous?: Card): void {
    if (this.matches("[active]") && !this.hasAttribute("data-alert-timeout")) return this.close();
    if (this.type != "alert"){
      document.querySelectorAll<Card>(`ste-card[active]`).forEach(card => {
        if (card.type != "dialog" && card.type != this.type) return;
        card.close();
        if (!card.matches(".minimize")) return;
        const transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
        window.setTimeout(() => card.minimize(),transitionDuration);
      });
    }
    this.setAttribute("active","");
    if (this.type == "widget" && card_backdrop.matches(".active")) card_backdrop.classList.remove("active");
    if (this.type == "alert"){
      const timeoutIdentifier = Math.random().toString();
      this.setAttribute("data-alert-timeout",timeoutIdentifier);
      window.setTimeout(() => {
        if (this.getAttribute("data-alert-timeout") != timeoutIdentifier) return;
        this.removeAttribute("data-alert-timeout");
        this.close();
      },4000);
    }
    if (this.type == "dialog"){
      document.body.addEventListener("keydown",Card.#catchCardNavigation);
      card_backdrop.classList.add("active");
      if (!activeDialog() && !dialogPrevious()){
        setDialogPrevious(document.activeElement as Card);
      }
      document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (previous) this.querySelector<HTMLElement>(`[data-card-previous="${previous.id}"]`)!.focus();
      },transitionDuration);
      setActiveDialog(this);
    }
    if (this.type == "widget") setActiveWidget(this);
  }

  minimize(): void {
    const icon = this.controls.minimize.querySelector<SVGUseElement>("svg use")!;
    const main = this.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    this.setAttribute("data-minimize-change",changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    if (!this.matches(".minimize")){
      this.classList.add("minimize");
      if (this.controls === undefined) return;
      this.style.setProperty("--card-minimize-width",`${this.controls.minimize.querySelector("svg")!.clientWidth + parseInt(getElementStyle({ element: this.controls.minimize, property: "--control-padding" }),10) * 2}px`);
      this.style.setProperty("--card-main-width",`${main.clientWidth}px`);
      this.style.setProperty("--card-main-height",`${main.clientHeight}px`);
      icon.setAttribute("href","#arrow_icon");
      window.setTimeout(() => {
        workspace_tabs.style.setProperty("--minimize-tab-width",getElementStyle({ element: this, property: "width" }));
        Editor.setTabsVisibility();
      },transitionDuration);
      if (this.contains(document.activeElement) && document.activeElement != this.controls.minimize) this.controls.minimize.focus();
    } else {
      this.classList.remove("minimize");
      window.setTimeout(() => {
        if (this.getAttribute("data-minimize-change") == changeIdentifier) this.style.removeProperty("--card-minimize-width");
      },transitionDuration);
      this.style.removeProperty("--card-main-width");
      this.style.removeProperty("--card-main-height");
      icon.setAttribute("href","#minimize_icon");
      workspace_tabs.style.removeProperty("--minimize-tab-width");
    }
    window.setTimeout(() => {
      if (this.getAttribute("data-minimize-change") == changeIdentifier) this.removeAttribute("data-minimize-change");
      if (workspace_tabs.getAttribute("data-minimize-change") == changeIdentifier) workspace_tabs.removeAttribute("data-minimize-change");
    },transitionDuration);
  }

  close(): void {
    this.removeAttribute("active");
    if (this.matches(".minimize")){
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => this.minimize(),transitionDuration);
    }
    if (this.type == "dialog"){
      document.body.removeEventListener("keydown",Card.#catchCardNavigation);
      card_backdrop.classList.remove("active");
      setActiveDialog(null);
      if (dialogPrevious()){
        const hidden = (getElementStyle({ element: dialogPrevious()!, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(dialogPrevious()!) && !hidden) ? dialogPrevious()!.focus({ preventScroll: true }) : activeEditor()?.focus({ preventScroll: true });
        setDialogPrevious(null);
      }
    }
    if (this.type == "widget") setActiveWidget(null);
  }

  /**
   * Gets all navigable elements within a given parent element.
   * 
   * @param options If the scope option is set to `true`, only direct children within the parent element will be selected.
  */
  static #getNavigableElements({ container, scope = false }: GetNavigableElementsOptions): HTMLElement[] {
    scope = (scope) ? "" : ":scope > ";
    const navigable: NodeListOf<HTMLElement> = container.querySelectorAll(`${scope}button:not([disabled]), ${scope}textarea:not([disabled]), ${scope}input:not([disabled]), ${scope}select:not([disabled]), ${scope}a[href]:not([disabled]), ${scope}[tabindex]:not([tabindex="-1"])`);
    return Array.from(navigable).filter(element => (getElementStyle({ element, property: "display" }) != "none"));
  }

  static #catchCardNavigation(event: KeyboardEvent): void {
    if (!activeDialog() || event.key != "Tab" || document.activeElement != document.body) return;
    const navigable = Card.#getNavigableElements({ container: activeDialog()!, scope: true });
    event.preventDefault();
    navigable[((!event.shiftKey) ? 0 : navigable.length - 1)]?.focus();
  }
}

export interface GetNavigableElementsOptions {
  container: HTMLElement;
  scope?: boolean | string;
}

window.customElements.define("ste-card",Card);

declare global {
  interface HTMLElementTagNameMap {
    "ste-card": Card;
  }
}