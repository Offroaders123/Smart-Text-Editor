import { getElementStyle } from "./app.js";
import { setEditorTabsVisibility } from "./Editor.js";

/**
 * The base component for the Alert, Dialog, and Widget card types.
*/
export class Card extends HTMLElement {
  declare defined;

  declare type: string | null;
  declare header: HTMLDivElement;
  declare back: HTMLButtonElement;
  declare heading: HTMLDivElement;
  declare controls: HTMLDivElement & { minimize: HTMLButtonElement; close: HTMLButtonElement; };

  constructor(){
    super();
    this.defined = false;
  }

  connectedCallback(){
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    this.addEventListener("keydown",event => {
      if (this.getAttribute("data-type") != "dialog" || event.key != "Tab") return;
      var navigable = Card.#getNavigableElements({ container: this, scope: true });
      if (!event.shiftKey){
        if (document.activeElement != navigable[navigable.length - 1]) return;
        event.preventDefault();
        navigable[0].focus();
      } else if (document.activeElement == navigable[0]){
        event.preventDefault();
        navigable[navigable.length - 1].focus();
      }
    });
    this.type = this.getAttribute("data-type");
    this.header = this.querySelector<HTMLDivElement>(".header")!;
    this.back = document.createElement("button");
    this.back.classList.add("card-back");
    this.back.innerHTML = `<svg><use href="#back_icon"/></svg>`;
    this.back.addEventListener("click",() => document.querySelector<Card>(`#${this.header?.getAttribute("data-card-parent")}`)!.open(this));
    this.heading = this.header.querySelector<HTMLDivElement>(".heading")!;
    this.controls = document.createElement("div") as typeof this.controls;
    this.controls.classList.add("card-controls");
    this.controls.minimize = document.createElement("button");
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
    this.controls.close = document.createElement("button");
    this.controls.close.classList.add("control");
    this.controls.close.setAttribute("data-control","close");
    this.controls.close.innerHTML = `<svg><use href="#close_icon"/></svg>`;
    this.controls.close.addEventListener("click",() => this.close());
    this.header.insertBefore(this.back,this.heading);
    this.controls.appendChild(this.controls.minimize);
    this.controls.appendChild(this.controls.close);
    this.header.appendChild(this.controls);
    if (STE.environment.macOSDevice){
      this.controls.insertBefore(this.controls.close,this.controls.minimize);
      this.header.insertBefore(this.controls,this.header.firstChild);
    }
  }

  open(previous?: Card){
    if (this.matches(".active") && !this.hasAttribute("data-alert-timeout")) return this.close();
    if (this.type != "alert"){
      document.querySelectorAll<Card>(`.card.active`).forEach(card => {
        if (card.type != "dialog" && card.type != this.type) return;
        card.close();
        if (!card.matches(".minimize")) return;
        var transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);
        window.setTimeout(() => card.minimize(),transitionDuration);
      });
    }
    this.classList.add("active");
    if (this.type == "widget" && card_backdrop.matches(".active")) card_backdrop.classList.remove("active");
    if (this.type == "alert"){
      var timeoutIdentifier = Math.random().toString();
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
      if (!STE.activeDialog && !STE.dialogPrevious){
        STE.dialogPrevious = document.activeElement as Card;
      }
      document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
      var transitionDuration = parseInt(`${Number(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 500}`);
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (previous) this.querySelector<HTMLElement>(`[data-card-previous="${previous.id}"]`)!.focus();
      },transitionDuration);
      STE.activeDialog = this;
    }
    if (this.type == "widget") STE.activeWidget = this;
  }

  minimize(){
    const icon = this.controls.minimize.querySelector<SVGUseElement>("svg use")!;
    const main = this.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    this.setAttribute("data-minimize-change",changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    var transitionDuration = parseInt(`${Number(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);
    if (!this.matches(".minimize")){
      this.classList.add("minimize");
      if (this.controls === undefined) return;
      this.style.setProperty("--card-minimize-width",`${this.controls.minimize.querySelector("svg")!.clientWidth + parseInt(getElementStyle({ element: this.controls.minimize, property: "--control-padding" }),10) * 2}px`);
      this.style.setProperty("--card-main-width",`${main.clientWidth}px`);
      this.style.setProperty("--card-main-height",`${main.clientHeight}px`);
      icon.setAttribute("href","#arrow_icon");
      window.setTimeout(() => {
        workspace_tabs.style.setProperty("--minimize-tab-width",getElementStyle({ element: this, property: "width" }));
        setEditorTabsVisibility();
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

  close(){
    this.classList.remove("active");
    if (this.matches(".minimize")){
      var transitionDuration = parseInt(`${Number(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => this.minimize(),transitionDuration);
    }
    if (this.type == "dialog"){
      document.body.removeEventListener("keydown",Card.#catchCardNavigation);
      card_backdrop.classList.remove("active");
      STE.activeDialog = null;
      if (STE.dialogPrevious){
        var hidden = (getElementStyle({ element: STE.dialogPrevious, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(STE.dialogPrevious) && !hidden) ? STE.dialogPrevious.focus({ preventScroll: true }) : STE.query().container?.focus({ preventScroll: true });
        STE.dialogPrevious = null;
      }
    }
    if (this.type == "widget") STE.activeWidget = null;
  }

  /**
   * Gets all navigable elements within a given parent element.
   * 
   * @param options - If the scope option is set to `true`, only direct children within the parent element will be selected.
  */
  static #getNavigableElements({ container, scope = false }: { container: HTMLElement; scope?: boolean | string; }){
    scope = (scope) ? "" : ":scope > ";
    var navigable: NodeListOf<HTMLElement> = container.querySelectorAll(`${scope}button:not([disabled]), ${scope}textarea:not([disabled]), ${scope}input:not([disabled]), ${scope}select:not([disabled]), ${scope}a[href]:not([disabled]), ${scope}[tabindex]:not([tabindex="-1"])`);
    return Array.from(navigable).filter(element => (getElementStyle({ element, property: "display" }) != "none"));
  }

  static #catchCardNavigation(event: KeyboardEvent){
    if (!STE.activeDialog || event.key != "Tab" || document.activeElement != document.body) return;
    var navigable = Card.#getNavigableElements({ container: STE.activeDialog, scope: true });
    event.preventDefault();
    navigable[((!event.shiftKey) ? 0 : navigable.length - 1)].focus();
  }
}

window.customElements.define("ste-card",Card);

declare global {
  interface HTMLElementTagNameMap {
    "ste-card": Card;
  }
}

export default Card;