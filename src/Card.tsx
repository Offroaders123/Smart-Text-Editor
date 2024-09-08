import { activeDialog, dialogPrevious, setDialogPrevious, setActiveDialog, setActiveWidget, activeEditor, cardBackdropShown, setCardBackdropShown, workspaceEditors, workspaceTabs } from "./STE.js";
import DecorativeImage from "./DecorativeImage.js";
import ArrowIcon from "./ArrowIcon.js";
import BackIcon from "./BackIcon.js";
import MinimizeIcon from "./MinimizeIcon.js";
import CloseIcon from "./CloseIcon.js";
import { query, setTabsVisibility } from "./Editor.js";
import { getElementStyle } from "./dom.js";
import "./Card.scss";

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
          <BackIcon/>
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
  private readonly header: HTMLDivElement = this.querySelector<HTMLDivElement>(".header")!;
  private readonly back: HTMLButtonElement | null = this.querySelector<HTMLButtonElement>(".card-back");
  readonly heading: HTMLDivElement = this.header.querySelector<HTMLDivElement>(".heading")!;
  readonly controls: CardControls = Object.assign(document.createElement("div"),{
    minimize: document.createElement("button"),
    close: document.createElement("button")
  });

  constructor() {
    super();

    this.addEventListener("keydown",event => {
      if (this.getAttribute("type") != "dialog" || event.key != "Tab") return;
      const navigable = getNavigableElements({ container: this, scope: true });
      if (!event.shiftKey){
        if (document.activeElement != navigable[navigable.length - 1]) return;
        event.preventDefault();
        navigable[0]?.focus();
      } else if (document.activeElement == navigable[0]){
        event.preventDefault();
        navigable[navigable.length - 1]?.focus();
      }
    });

    this.back?.addEventListener("click",() => openCard(document.querySelector<Card>(`#${this.header?.getAttribute("data-card-parent")}`)!, this));

    this.controls.classList.add("card-controls");

    this.controls.minimize.classList.add("control");
    this.controls.minimize.setAttribute("data-control","minimize");
    this.controls.minimize.append(MinimizeIcon() as Element);

    this.controls.minimize.addEventListener("keydown",event => {
      if (event.key != "Enter") return;
      event.preventDefault();
      if (event.repeat) return;
      this.controls?.minimize.click();
    });

    this.controls.minimize.addEventListener("click",() => minimizeCard(this));

    this.controls.close.classList.add("control");
    this.controls.close.setAttribute("data-control","close");
    this.controls.close.append(CloseIcon() as Element);

    this.controls.close.addEventListener("click",() => closeCard(this));

    this.controls.appendChild(this.controls.minimize);
    this.controls.appendChild(this.controls.close);
    this.header.appendChild(this.controls);
  }
}

  export function openCard(self: string | Card, previous?: Card): void {
    if (typeof self === "string") {
      self = document.getElementById(self)! as Card;
    }

    if (self.matches("[active]") && !self.hasAttribute("data-alert-timeout")) return closeCard(self);
    if (self.type != "alert"){
      document.querySelectorAll<Card>(`ste-card[active]`).forEach(card => {
        if (card.type != "dialog" && card.type != self.type) return;
        closeCard(card);
        if (!card.matches(".minimize")) return;
        const transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
        window.setTimeout(() => minimizeCard(card),transitionDuration);
      });
    }
    self.setAttribute("active","");
    if (self.type == "widget" && cardBackdropShown()) setCardBackdropShown(false);
    if (self.type == "alert"){
      const timeoutIdentifier = Math.random().toString();
      self.setAttribute("data-alert-timeout",timeoutIdentifier);
      window.setTimeout(() => {
        if (self.getAttribute("data-alert-timeout") != timeoutIdentifier) return;
        self.removeAttribute("data-alert-timeout");
        closeCard(self);
      },4000);
    }
    if (self.type == "dialog"){
      document.body.addEventListener("keydown",catchCardNavigation);
      setCardBackdropShown(true);
      if (!activeDialog() && !dialogPrevious()){
        setDialogPrevious(document.activeElement?.id ?? null);
      }
      document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (previous) self.querySelector<HTMLElement>(`[data-card-previous="${previous.id}"]`)!.focus();
      },transitionDuration);
      setActiveDialog(self.id);
    }
    if (self.type == "widget") setActiveWidget(self.id);
  }

  export function minimizeCard(self: string | Card): void {
    if (typeof self === "string") {
      self = document.getElementById(self)! as Card;
    }

    const workspace_tabs: HTMLDivElement = workspaceTabs()!;
    const icon = self.controls.minimize.querySelector("svg")!;
    const main = self.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    self.setAttribute("data-minimize-change",changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    if (!self.matches(".minimize")){
      self.classList.add("minimize");
      if (self.controls === undefined) return;
      self.style.setProperty("--card-minimize-width",`${self.controls.minimize.querySelector("svg")!.clientWidth + parseInt(getElementStyle({ element: self.controls.minimize, property: "--control-padding" }),10) * 2}px`);
      self.style.setProperty("--card-main-width",`${main.clientWidth}px`);
      self.style.setProperty("--card-main-height",`${main.clientHeight}px`);
      icon.replaceWith(ArrowIcon() as Element);
      window.setTimeout(() => {
        workspace_tabs.style.setProperty("--minimize-tab-width",getElementStyle({ element: self, property: "width" }));
        setTabsVisibility();
      },transitionDuration);
      if (self.contains(document.activeElement) && document.activeElement != self.controls.minimize) self.controls.minimize.focus();
    } else {
      self.classList.remove("minimize");
      window.setTimeout(() => {
        if (self.getAttribute("data-minimize-change") == changeIdentifier) self.style.removeProperty("--card-minimize-width");
      },transitionDuration);
      self.style.removeProperty("--card-main-width");
      self.style.removeProperty("--card-main-height");
      icon.replaceWith(MinimizeIcon() as Element);
      workspace_tabs.style.removeProperty("--minimize-tab-width");
    }
    window.setTimeout(() => {
      if (self.getAttribute("data-minimize-change") == changeIdentifier) self.removeAttribute("data-minimize-change");
      if (workspace_tabs.getAttribute("data-minimize-change") == changeIdentifier) workspace_tabs.removeAttribute("data-minimize-change");
    },transitionDuration);
  }

  export function closeCard(self: string | Card): void {
    if (typeof self === "string") {
      self = document.getElementById(self)! as Card;
    }

    self.removeAttribute("active");
    if (self.matches(".minimize")){
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => minimizeCard(self),transitionDuration);
    }
    if (self.type == "dialog"){
      const workspace_editors: HTMLDivElement = workspaceEditors()!;
      document.body.removeEventListener("keydown",catchCardNavigation);
      setCardBackdropShown(false);
      setActiveDialog(null);
      if (dialogPrevious()){
        const hidden = (getElementStyle({ element: document.getElementById(dialogPrevious()!)!, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(document.getElementById(dialogPrevious()!)!) && !hidden) ? document.getElementById(dialogPrevious()!)!.focus({ preventScroll: true }) : query(activeEditor())?.ref.focus({ preventScroll: true });
        setDialogPrevious(null);
      }
    }
    if (self.type == "widget") setActiveWidget(null);
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

  function catchCardNavigation(event: KeyboardEvent): void {
    if (!activeDialog() || event.key != "Tab" || document.activeElement != document.body) return;
    const navigable = getNavigableElements({ container: document.getElementById(activeDialog()!)!, scope: true });
    event.preventDefault();
    navigable[((!event.shiftKey) ? 0 : navigable.length - 1)]?.focus();
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