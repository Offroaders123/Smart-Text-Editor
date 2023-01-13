class STECardElement extends HTMLElement {
  constructor(){
    super();
    this.defined = false;
  }

  connectedCallback(){
    if (this.defined || !this.isConnected) return;
    this.defined = true;
    this.addEventListener("keydown",event => {
      if (this.getAttribute("data-type") != "dialog" || event.key != "Tab") return;
      var navigable = getNavigableElements({ container: this, scope: true });
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
    this.header = /** @type { HTMLDivElement } */ (this.querySelector(".header"));
    this.back = document.createElement("button");
    this.back.classList.add("card-back");
    this.back.innerHTML = `<svg><use href="#back_icon"/></svg>`;
    this.back.addEventListener("click",() => /** @type { STECardElement } */ (document.querySelector(`#${this.header?.getAttribute("data-card-parent")}`)).open(this));
    this.heading = /** @type { HTMLDivElement } */ (this.header.querySelector(".heading"));
    this.controls = /** @type { HTMLDivElement & { minimize: HTMLButtonElement; close: HTMLButtonElement; } } */ (document.createElement("div"));
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
    if (Editor.environment.macOS_device){
      this.controls.insertBefore(this.controls.close,this.controls.minimize);
      this.header.insertBefore(this.controls,this.header.firstChild);
    }
  }

  /**
   * @param { STECardElement } [previous]
  */
  open(previous){
    if (this.matches(".active") && !this.hasAttribute("data-alert-timeout")) return this.close();
    if (this.type != "alert"){
      /** @type { NodeListOf<STECardElement> } */ (document.querySelectorAll(`.card.active`)).forEach(card => {
        if (card.type != "dialog" && card.type != this.type) return;
        card.close();
        if (!card.matches(".minimize")) return;
        var transitionDuration = parseInt(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000;
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
      document.body.addEventListener("keydown",catchCardNavigation);
      card_backdrop.classList.add("active");
      if (!Editor.active_dialog && !Editor.dialog_previous){
        Editor.dialog_previous = /** @type { STECardElement } */ (document.activeElement);
      }
      /** @type { NodeListOf<MenuDropElement> } */ (document.querySelectorAll("menu-drop[data-open]")).forEach(menu => menu.close());
      var transitionDuration = parseInt(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 500;
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (previous) /** @type { HTMLElement } */ (this.querySelector(`[data-card-previous="${previous.id}"]`)).focus();
      },transitionDuration);
      Editor.active_dialog = this;
    }
    if (this.type == "widget") Editor.active_widget = this;
  }

  minimize(){
    var icon = /** @type { SVGUseElement } */ (this.controls?.minimize.querySelector("svg use")), main = /** @type { HTMLDivElement } */ (this.querySelector(".main")), changeIdentifier = Math.random().toString();
    this.setAttribute("data-minimize-change",changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    var transitionDuration = parseInt(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000;
    if (!this.matches(".minimize")){
      this.classList.add("minimize");
      if (this.controls === undefined) return;
      this.style.setProperty("--card-minimize-width",`${this.controls?.minimize.querySelector("svg")?.clientWidth ?? "" + parseInt(getElementStyle({ element: this.controls.minimize, property: "--control-padding" }),10) * 2}px`);
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
      var transitionDuration = parseInt(getElementStyle({ element: this, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000;
      window.setTimeout(() => this.minimize(),transitionDuration);
    }
    if (this.type == "dialog"){
      document.body.removeEventListener("keydown",catchCardNavigation);
      card_backdrop.classList.remove("active");
      Editor.active_dialog = null;
      if (Editor.dialog_previous){
        var hidden = (getElementStyle({ element: Editor.dialog_previous, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(Editor.dialog_previous) && !hidden) ? Editor.dialog_previous.focus({ preventScroll: true }) : Editor.query().container.focus({ preventScroll: true });
        Editor.dialog_previous = null;
      }
    }
    if (this.type == "widget") Editor.active_widget = null;
  }
}
/**
 * @param { KeyboardEvent } event
*/
function catchCardNavigation(event){
  if (!Editor.active_dialog || event.key != "Tab" || document.activeElement != document.body) return;
  var navigable = getNavigableElements({ container: Editor.active_dialog, scope: true });
  event.preventDefault();
  navigable[((!event.shiftKey) ? 0 : navigable.length - 1)].focus();
}
window.customElements.define("ste-card",STECardElement);

document.querySelectorAll("img").forEach(image => image.draggable = false);
/** @type { NodeListOf<NumTextElement> } */ (document.querySelectorAll("num-text")).forEach(textarea => applyEditingBehavior({ element: textarea }));
/** @type { NodeListOf<HTMLInputElement> } */ (document.querySelectorAll("input:is([type='text'],[type='url'])")).forEach(input => applyEditingBehavior({ element: input }));
/** @type { NodeListOf<HTMLDivElement> } */ (document.querySelectorAll(".checkbox")).forEach(checkbox => {
  var input = /** @type { HTMLInputElement } */ (checkbox.querySelector("input[type='checkbox']"));
  checkbox.addEventListener("click",() => input.click());
  checkbox.addEventListener("keydown",event => {
    if (!event.repeat && event.key == "Enter") input.click();
  });
  checkbox.addEventListener("keyup",event => {
    if (event.key == " ") input.click();
  });
  checkbox.tabIndex = 0;
  input.addEventListener("click",event => event.stopPropagation());
});
/** @type { NodeListOf<HTMLButtonElement | HTMLAnchorElement> } */ (document.querySelectorAll("header .app-omnibox .option")).forEach(option => {
  option.tabIndex = -1;
  option.addEventListener("mousedown",event => event.preventDefault());
});
class Tools {
  static replaceText = {
    replace() {
      var { container: editor } = Editor.query();
      if (!editor) return;
      var replaced = editor.value.split(replacer_find.value).join(replacer_replace.value);
      if (replaced != editor.value) editor.value = replaced;
    },

    flip() {
      [replacer_find.value,replacer_replace.value] = [replacer_replace.value,replacer_find.value];
    },

    clear() {
      [replacer_find.value,replacer_replace.value] = "";
    }
  }

  static jsonFormatter = {
    format(spacing = "  ") {
      try {
        var formatted = JSON.stringify(JSON.parse(formatter_input.value),null,spacing);
        if (formatted != formatter_input.value) formatter_input.value = formatted;
      } catch (/** @type { any } */ error){/* Make matching for "position" optional, as Safari doesn't give JSON parsing error data, it only says that an error occurred. */
        var message = error.toString().match(/^(.+?)position /)[0],
          errorIndex = error.toString().match(/position (\d+)/)[1],

          errorLine,
          errorLineIndex = (() => {
            var lineIndexes = indexi("\n",formatter_input.value);
            errorLine = formatter_input.value.substring(0,errorIndex).split("\n").length - 1;
            return lineIndexes[errorLine - 1] || 1;
          })(),
          errorPosition = errorIndex - errorLineIndex + 1;

        alert(`Could not parse JSON, an error occurred.\n${message}line ${errorLine + 1} position ${errorPosition}`);
      }


    /**
     * @param { string } char
     * @param { string } str
    */
    function indexi(char,str){
      var list = [], i = -1;
      while ((i = str.indexOf(char,i + 1)) >= 0) list.push(i + 1);
      return list;
    }


    },

    collapse() {
      Tools.jsonFormatter.format("");
    },

    clear() {
      formatter_input.value = "";
    }
  }

  static uriEncoder = {
    encode() {
      var encodingType = (!encoder_type.checked) ? encodeURI : encodeURIComponent;
      encoder_input.value = encodingType(encoder_input.value);
    },

    decode() {
      var decodingType = (!encoder_type.checked) ? decodeURI : decodeURIComponent;
      encoder_input.value = decodingType(encoder_input.value);
    },

    clear() {
      encoder_input.value = "";
    }
  }

  static uuidGenerator = (() => {
    /** @type { string[] } */
    var lut = [];
    for (var i = 0; i < 256; i++) lut[i] = ((i < 16) ? "0" : "") + i.toString(16);
    return {
      generate: () => {
        var d0 = (Math.random() * 0xffffffff) | 0, d1 = (Math.random() * 0xffffffff) | 0, d2 = (Math.random() * 0xffffffff) | 0, d3 = (Math.random() * 0xffffffff) | 0;
        return `${lut[d0 & 0xff]}${lut[(d0 >> 8) & 0xff]}${lut[(d0 >> 16) & 0xff]}${lut[(d0 >> 24) & 0xff]}-${lut[d1 & 0xff]}${lut[(d1 >> 8) & 0xff]}-${lut[((d1 >> 16) & 0x0f) | 0x40]}${lut[(d1 >> 24) & 0xff]}-${lut[(d2 & 0x3f) | 0x80]}${lut[(d2 >> 8) & 0xff]}-${lut[(d2 >> 16) & 0xff]}${lut[(d2 >> 24) & 0xff]}${lut[d3 & 0xff]}${lut[(d3 >> 8) & 0xff]}${lut[(d3 >> 16) & 0xff]}${lut[(d3 >> 24) & 0xff]}`;
      }
    };
  })()

  /**
   * @param { { type: string; } } options
  */
  static insertTemplate({ type }) {
    var template, editor = Editor.query(), name;
    if (type == "html"){
      var language = navigator.language;
      if (language.includes("-")) language = language.replace(/[^-]+$/g,code => code.toUpperCase());
      name = "index.html";
      template = decodeURI(`%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22${language}%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E`);
    }
    if (type == "pack-manifest-bedrock"){
      name = "manifest.json";
      template = decodeURI(`%7B%0A%20%20%22format_version%22:%202,%0A%0A%20%20%22header%22:%20%7B%0A%20%20%20%20%22name%22:%20%22Pack%20Manifest%20Template%20-%20Bedrock%20Edition%22,%0A%20%20%20%20%22description%22:%20%22Your%20resource%20pack%20description%22,%0A%20%20%20%20%22uuid%22:%20%22${Tools.uuidGenerator.generate()}%22,%0A%20%20%20%20%22version%22:%20%5B%201,%200,%200%20%5D,%0A%20%20%20%20%22min_engine_version%22:%20%5B%201,%2013,%200%20%5D%0A%20%20%7D,%0A%20%20%22modules%22:%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22description%22:%20%22Your%20resource%20pack%20description%22,%0A%20%20%20%20%20%20%22type%22:%20%22resources%22,%0A%20%20%20%20%20%20%22uuid%22:%20%22${Tools.uuidGenerator.generate()}%22,%0A%20%20%20%20%20%20%22version%22:%20%5B%201,%200,%200%20%5D%0A%20%20%20%20%7D%0A%20%20%5D,%0A%20%20%22metadata%22:%20%7B%0A%20%20%20%20%22authors%22:%20%5B%0A%20%20%20%20%20%20%22Add%20author%20names%20here%20(optional,%20'metadata'%20can%20be%20removed%20altogether)%22%0A%20%20%20%20%5D%0A%20%20%7D%0A%7D`);
    }
    if (!template) return;
    createEditor({ name, value: template });
    if (Editor.view == "preview") setView({ type: "split" });
  }
};
window.addEventListener("load",() => {
  if (Editor.environment.file_protocol) return;
  if (window.location.href.includes("index.html")) history.pushState(null,"",window.location.href.replace(/index.html/,""));
  if (!("serviceWorker" in navigator) || !Editor.appearance.parent_window) return;
  navigator.serviceWorker.register("service-worker.js").then(() => {
    if ((navigator.serviceWorker.controller) ? (navigator.serviceWorker.controller.state == "activated") : false) activateManifest();
    navigator.serviceWorker.addEventListener("message",event => {
      if (event.data.action == "service-worker-activated") activateManifest();
      if (event.data.action == "clear-site-caches-complete") cleared_cache_card.open();
      if (event.data.action == "share-target"){
        event.data.files.forEach(/** @param { File } file */ file => {
          var reader = new FileReader();
          reader.readAsText(file,"UTF-8");
          reader.addEventListener("loadend",() => createEditor({ name: file.name, value: /** @type { string } */ (reader.result) }));
        });
      }
    });
    document.documentElement.classList.add("service-worker-activated");
    if (queryParameters.get("share-target")){
      if (navigator.serviceWorker.controller === null) return;
      navigator.serviceWorker.controller.postMessage({ action: "share-target" });
      removeQueryParameters(["share-target"]);
    }
  });
  function activateManifest(){
    /** @type { HTMLLinkElement } */ (document.querySelector("link[rel='manifest']")).href = "manifest.webmanifest";
  }
});
window.addEventListener("beforeinstallprompt",event => {
  event.preventDefault();
  Editor.install_prompt = event;
  document.documentElement.classList.add("install-prompt-available");
  theme_button.childNodes[0].textContent = "Theme";
});
window.addEventListener("beforeunload",event => {
  if (Editor.unsaved_work) return;
  event.preventDefault();
  event.returnValue = "";
});
window.addEventListener("unload",() => Editor.child_windows.forEach(window => window.close()));
window.addEventListener("resize",event => {
  Editor.appearance.refresh_device_pixel_ratio();
  if (Editor.view != "preview") setEditorTabsVisibility();
  if (Editor.view == "split" && document.body.hasAttribute("data-scaling-active")) setView({ type: "split" });
});
window.addEventListener("blur",() => {
  if (Editor.appearance.parent_window) /** @type { NodeListOf<MenuDropElement> } */ (document.querySelectorAll("menu-drop[data-open]")).forEach(menu => menu.close());
});
if (Editor.support.window_controls_overlay) navigator.windowControlsOverlay.addEventListener("geometrychange",() => Editor.appearance.refresh_window_controls_overlay());
document.body.addEventListener("keydown",event => {
  /**
   * @param { string } key
  */
  var pressed = key => (event.key.toLowerCase() == key.toLowerCase()),
    control = (event.ctrlKey && !Editor.environment.apple_device),
    command = (event.metaKey && Editor.environment.apple_device),
    shift = (event.shiftKey || ((event.key.toUpperCase() == event.key) && (event.key + event.key == String(Number(event.key) * 2)))),
    controlShift = (control && shift),
    shiftCommand = (shift && command),
    controlCommand = (event.ctrlKey && command);

  if (pressed("Escape")){
    event.preventDefault();
    if (event.repeat) return;
    if (Editor.active_dialog && !document.activeElement?.matches("menu-drop[data-open]")) Editor.active_dialog.close();
  }
  if (((control || command) && !shift && pressed("n")) || ((controlShift || shiftCommand) && pressed("x"))){
    event.preventDefault();
    if (event.repeat) return;
    createEditor({ auto_replace: false });
  }
  if (((control || command) && pressed("w")) || ((controlShift || shiftCommand) && pressed("d"))){
    if (shift && pressed("w")) return window.close();
    event.preventDefault();
    if (event.repeat) return;
    /* Future feature: If an editor tab is focused, close that editor instead of only the active editor */
    closeEditor();
  }
  if (((controlShift || (event.ctrlKey && shift && !command && Editor.environment.apple_device)) && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("[") || pressed("{")))){
    event.preventDefault();
    if (event.repeat) return;
    // For both of these expected errors, I need to add handling for when there aren't any Editors opened, since it will throw an error trying to open the next editor, when there isn't one there. There's not even one to start from in that case, either!
    // @ts-expect-error
    openEditor({ identifier: getPreviousEditor() });
  }
  if (((control || (event.ctrlKey && !command && Editor.environment.apple_device)) && !shift && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("]") || pressed("}")))){
    event.preventDefault();
    if (event.repeat) return;
    // @ts-expect-error
    openEditor({ identifier: getNextEditor() });
  }
  if (((controlShift || shiftCommand) && pressed("n")) || ((controlShift || shiftCommand) && pressed("c"))){
    event.preventDefault();
    if (event.repeat) return;
    createWindow();
  }
  if ((control || command) && !shift && pressed("o")){
    event.preventDefault();
    if (event.repeat) return;
    openFiles();
  }
  if ((controlShift || shiftCommand) && pressed("r")){
    event.preventDefault();
    if (event.repeat) return;
    renameEditor();
  }
  if ((control || command) && !shift && pressed("s")){
    event.preventDefault();
    if (event.repeat) return;
    saveFile();
  }
  if ((controlShift || controlCommand) && (pressed("1") || pressed("!"))){
    event.preventDefault();
    if (event.repeat) return;
    setView({ type: "code" });
  }
  if ((controlShift || controlCommand) && (pressed("2") || pressed("@"))){
    event.preventDefault();
    if (event.repeat) return;
    setView({ type: "split" });
  }
  if ((controlShift || controlCommand) && (pressed("3") || pressed("#"))){
    event.preventDefault();
    if (event.repeat) return;
    setView({ type: "preview" });
  }
  if ((controlShift || controlCommand) && (pressed("4") || pressed("$"))){
    event.preventDefault();
    if (event.repeat) return;
    setOrientation();
  }
  if ((controlShift || controlCommand) && (pressed("5") || pressed("%"))){
    event.preventDefault();
    if (event.repeat) return;
    createDisplay();
  }
  if ((controlShift || shiftCommand) && pressed("Enter")){
    event.preventDefault();
    if (event.repeat) return;
    refreshPreview({ force: true });
  }
  if ((controlShift || shiftCommand) && pressed("B")){
    event.preventDefault();
    if (event.repeat) return;
    preview_base_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("f")){
    event.preventDefault();
    if (event.repeat) return;
    replace_text_card.open();
  }/*
  if ((controlShift || shiftCommand) && pressed("k")){
    event.preventDefault();
    if (event.repeat) return;
    color_picker_card.open();
  }*/
  if ((controlShift || shiftCommand) && pressed("g")){
    event.preventDefault();
    if (event.repeat) return;
    json_formatter_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("y")){
    event.preventDefault();
    if (event.repeat) return;
    uri_encoder_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("o")){
    event.preventDefault();
    if (event.repeat) return;
    uuid_generator_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    Tools.insertTemplate({ type: "html" });
  }
  if ((controlShift || shiftCommand) && pressed("m")){
    event.preventDefault();
    if (event.repeat || !Editor.active_widget) return;
    if (Editor.active_widget) Editor.active_widget.minimize();
  }
  if ((control || command) && (pressed(",") || pressed("<"))){
    event.preventDefault();
    if (event.repeat) return;
    settings_card.open();
  }
},{ capture: true });
document.body.addEventListener("mousedown",event => {
  if (event.button != 2) return;
  event.preventDefault();
  event.stopPropagation();
});
document.body.addEventListener("contextmenu",event => event.preventDefault());
document.body.addEventListener("dragover",event => {
  event.preventDefault();
  if (event.dataTransfer === null || !(event.target instanceof Element)) return;
  event.dataTransfer.dropEffect = (event.target.matches("menu-drop, header, .card") || event.target.closest("menu-drop, header, .card")) ? "none" : "copy";
});
document.body.addEventListener("drop",event => {
  event.preventDefault();
  /** @type { NodeListOf<MenuDropElement> } */ (document.querySelectorAll("menu-drop[data-open]")).forEach(menu => menu.close());
  if (event.dataTransfer === null) return;
  Array.from(event.dataTransfer.items).forEach(async (item,index) => {
    if (item.kind == "file"){
      if (!Editor.support.file_system || !("getAsFileSystemHandle")){
        var file = item.getAsFile(), reader = new FileReader();
        if (file === null) return;
        reader.readAsText(file,"UTF-8");
        reader.addEventListener("loadend",() => createEditor({ name: file?.name, value: /** @type { string } */ (reader.result) }));
      } else {
        var handle = await item.getAsFileSystemHandle();
        if (handle === null) return;
        if (handle.kind != "file" || !(handle instanceof FileSystemFileHandle)) return;
        let file = await handle.getFile(), identifier = createEditor({ name: file.name, value: await file.text() });
        Editor.file_handles[identifier] = handle;
      }
    } else if (item.kind == "string" && index == 0 && event.dataTransfer?.getData("text") != "") createEditor({ value: event.dataTransfer?.getData("text") });
  });
});
var appToolbar = /** @type { HTMLDivElement } */ (document.querySelector("header .app-menubar"));
/** @type { NodeListOf<MenuDropElement> } */ (appToolbar.querySelectorAll("menu-drop")).forEach(menu => {
  menu.addEventListener("pointerenter",event => {
    if (event.pointerType != "mouse") return;
    if (appToolbar.querySelectorAll("menu-drop:not([data-alternate])[data-open]").length == 0 || menu.matches("[data-alternate]") || menu.matches("[data-open]")) return;
    menu.opener.focus();
    /** @type { NodeListOf<MenuDropElement> } */ (appToolbar.querySelectorAll("menu-drop[data-open]")).forEach(menu => menu.close());
    menu.open();
  });
});
workspace_tabs.addEventListener("keydown",event => {
  if (event.key != "ArrowLeft" && event.key != "ArrowRight") return;
  if (!workspace_tabs.contains(document.activeElement) || !(document.activeElement instanceof HTMLElement)) return;
  var identifier = document.activeElement.getAttribute("data-editor-identifier"),
    previousEditor = getPreviousEditor({ identifier }),
    nextEditor = getNextEditor({ identifier });
  event.preventDefault();
  if (event.key == "ArrowLeft") Editor.query(previousEditor).tab.focus();
  if (event.key == "ArrowRight") Editor.query(nextEditor).tab.focus();
});
create_editor_button.addEventListener("keydown",event => {
  if (event.key != "Enter") return;
  if (event.repeat) event.preventDefault();
});
create_editor_button.addEventListener("mousedown",event => event.preventDefault());
create_editor_button.addEventListener("click",() => createEditor({ auto_replace: false }));
scaler.addEventListener("mousedown",event => {
  if (event.button != 0) return;
  if (Editor.view != "split") return;
  event.preventDefault();
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("mousemove",setScaling);
  document.addEventListener("mouseup",disableScaling);
});
scaler.addEventListener("touchstart",event => {
  if (Editor.view != "split" || event.touches.length != 1) return;
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("touchmove",setScaling,{ passive: true });
  document.addEventListener("touchend",disableScaling,{ passive: true });
},{ passive: true });
card_backdrop.addEventListener("click",() => {
  if (Editor.active_dialog === null) return;
  Editor.active_dialog.close();
});
preview_base_input.placeholder = document.baseURI;
preview_base_input.setWidth = () => preview_base_input.style.setProperty("--input-count",preview_base_input.value.length.toString());
preview_base_input.setValue = value => {
  preview_base_input.value = value;
  preview_base_input.setWidth();
};
preview_base_input.reset = () => {
  preview_base_input.setValue("");
  if (!Editor.settings.has("preview-base")) return;
  Editor.settings.remove("preview-base");
  refreshPreview({ force: true });
};
preview_base_input.style.setProperty("--placeholder-count",preview_base_input.placeholder.length.toString());
preview_base_input.addEventListener("input",event => /** @type { typeof preview_base_input } */ (event.target).setWidth());
preview_base_input.addEventListener("change",event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  var empty = event.target.matches(":placeholder-shown"), valid = event.target.matches(":valid");
  if (empty || !valid) Editor.settings.remove("preview-base");
  if (!empty && valid) Editor.settings.set("preview-base",event.target.value);
  if (empty || valid) refreshPreview({ force: true });
});
generator_output.addEventListener("click",() => generator_output.select());
generator_output.addEventListener("keydown",() => generator_output.click());

window.requestAnimationFrame(() => createEditor({ auto_created: true }));
if (Editor.appearance.parent_window){
  if (Editor.settings.get("default-orientation")){
    var value = Editor.settings.get("default-orientation");
    window.requestAnimationFrame(() => default_orientation_setting.select(value));
    setOrientation(value);
  }
  if (Editor.settings.get("syntax-highlighting") != undefined){
    var state = Editor.settings.get("syntax-highlighting");
    setSyntaxHighlighting(state);
    syntax_highlighting_setting.checked = state;
  }
  if (Editor.settings.get("automatic-refresh") != undefined) automatic_refresh_setting.checked = Editor.settings.get("automatic-refresh");
  if (Editor.settings.get("preview-base")) preview_base_input.setValue(Editor.settings.get("preview-base"));
  window.setTimeout(() => document.documentElement.classList.remove("startup-fade"),50);
}
if (Editor.support.file_handling && Editor.support.file_system){
  window.launchQueue.setConsumer(params => {
    params.files.forEach(async handle => {
      var file = await handle.getFile(), identifier = createEditor({ name: file.name, value: await file.text() });
      Editor.file_handles[identifier] = handle;
    });
    if (!Editor.environment.touch_device) Editor.query().container.focus({ preventScroll: true });
  });
}
var queryParameters = new URLSearchParams(window.location.search);
if (queryParameters.get("template")){
  Tools.insertTemplate({ type: "html" });
  removeQueryParameters(["template"]);
}
if (queryParameters.get("settings")){
  settings_card.open();
  removeQueryParameters(["settings"]);
}
function createEditor({ name = "Untitled.txt", value = "", open = true, auto_created = false, auto_replace = true } = {}){
  let identifier = Math.random().toString(),
    tab = document.createElement("button"),
    editorName = document.createElement("span"),
    editorClose = document.createElement("button"),
    container = /** @type { NumTextElement } */ (document.createElement("num-text")),
    previewOption = document.createElement("li"),
    /** @type { boolean | undefined } */
    focused_override,
    changeIdentifier = Math.random().toString();

  document.body.setAttribute("data-editor-change",changeIdentifier);
  var transitionDuration = parseInt(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000;
  if (!name.includes(".")) name = `${name}.txt`;
  tab.classList.add("tab");
  tab.setAttribute("data-editor-identifier",identifier);
  if (value) tab.setAttribute("data-editor-refresh","");
  tab.addEventListener("mousedown",event => {
    if (document.activeElement === null) return;
    if (event.button != 0 || document.activeElement.matches("[data-editor-rename]")) return;
    event.preventDefault();
    if (tab != Editor.query().tab) openEditor({ identifier });
  });
  tab.addEventListener("keydown",event => {
    if (event.key != " " && event.key != "Enter") return;
    event.preventDefault();
    if (tab != Editor.query().tab) openEditor({ identifier });
  });
  tab.addEventListener("contextmenu",event => {
    if (event.target != tab) return;
    var editorRename = /** @type { HTMLInputElement } */ (tab.querySelector("[data-editor-rename]"));
    if (!editorRename){
      editorRename = document.createElement("input");
    } else return editorRename.blur();
    editorRename.type = "text";
    editorRename.placeholder = /** @type { string } */ (Editor.query(identifier).getName());
    editorRename.setAttribute("data-editor-rename","");
    editorRename.tabIndex = -1;
    editorRename.style.setProperty("--editor-name-width",`${editorName.offsetWidth}px`);
    editorRename.value = /** @type { string } */ (Editor.query(identifier).getName());
    editorRename.addEventListener("keydown",event => {
      if (event.key == "Escape") editorRename.blur();
    });
    editorRename.addEventListener("input",() => {
      editorRename.style.width = "0px";
      editorRename.offsetWidth;
      editorRename.style.setProperty("--editor-rename-width",`${editorRename.scrollWidth + 1}px`);
      editorRename.style.removeProperty("width");
    });
    editorRename.addEventListener("change",() => {
      if (editorRename.value) renameEditor({ name: editorRename.value, identifier });
      editorRename.blur();
    });
    editorRename.addEventListener("blur",() => editorRename.remove());
    tab.insertBefore(editorRename,tab.firstChild);
    applyEditingBehavior({ element: editorRename });
    editorRename.focus();
    editorRename.select();
  });
  tab.addEventListener("dragover",event => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer !== null) event.dataTransfer.dropEffect = "copy";
    if (tab != Editor.query().tab) openEditor({ identifier });
  });
  editorName.setAttribute("data-editor-name",name);
  editorName.innerText = name;
  editorClose.classList.add("option");
  editorClose.tabIndex = -1;
  editorClose.innerHTML = "<svg><use href='#close_icon'/></svg>";
  editorClose.addEventListener("mousedown",event => {
    event.preventDefault();
    event.stopPropagation();
  });
  editorClose.addEventListener("click",event => {
    event.stopPropagation();
    closeEditor({ identifier });
  });
  container.classList.add("editor");
  container.setAttribute("data-editor-identifier",identifier);
  container.setAttribute("value",value);
  previewOption.part.add("option");
  previewOption.classList.add("option");
  previewOption.setAttribute("data-editor-identifier",identifier);
  previewOption.tabIndex = -1;
  previewOption.innerText = name;
  previewOption.addEventListener("click",() => setPreviewSource({ identifier }));
  if ((Editor.active_editor) ? Editor.query().tab.hasAttribute("data-editor-auto-created") : false){
    if (document.activeElement == Editor.query().container) focused_override = true;
    if (auto_replace){
      closeEditor();
    } else Editor.query().tab.removeAttribute("data-editor-auto-created");
  }
  tab.appendChild(editorName);
  tab.appendChild(editorClose);
  workspace_tabs.insertBefore(tab,create_editor_button);
  workspace_editors.appendChild(container);
  container.editor.addEventListener("input",() => {
    if (tab.hasAttribute("data-editor-auto-created")) tab.removeAttribute("data-editor-auto-created");
    if (!tab.hasAttribute("data-editor-refresh")) tab.setAttribute("data-editor-refresh","");
    if (!tab.hasAttribute("data-editor-unsaved")) tab.setAttribute("data-editor-unsaved","");
    refreshPreview();
  });
  preview_menu.main.appendChild(previewOption);
  applyEditingBehavior({ element: container });
  if (open || !Editor.active_editor) openEditor({ identifier, auto_created, focused_override });
  container.syntaxLanguage = /** @type { string } */ (Editor.query(identifier).getName("extension"));
  if ((Editor.settings.get("syntax-highlighting") == true) && (container.syntaxLanguage in Prism.languages)) container.syntaxHighlight.enable();
  window.setTimeout(() => {
    if (document.body.getAttribute("data-editor-change") == changeIdentifier) document.body.removeAttribute("data-editor-change");
  },transitionDuration);
  return identifier;
}
/**
 * @param { { identifier: string; auto_created?: boolean; focused_override?: boolean; } } options
*/
function openEditor({ identifier, auto_created = false, focused_override = false }){
  if (!identifier) return;
  const { tab, container, textarea, getName } = Editor.query(identifier),
    focused = (document.activeElement == Editor.query().container) || focused_override;
  if (Editor.query().tab) Editor.query().tab.classList.remove("active");
  if (Editor.query().container) Editor.query().container.classList.remove("active");
  tab.classList.add("active");
  if (auto_created) tab.setAttribute("data-editor-auto-created","");
  container.classList.add("active");
  Editor.active_editor = identifier;
  setEditorTabsVisibility();
  setTitle({ content: /** @type { string } */ (getName()) });
  if ((((document.activeElement == document.body && !Editor.active_dialog) || auto_created) && !Editor.environment.touch_device && Editor.appearance.parent_window) || focused) container.focus({ preventScroll: true });
  if (Editor.preview_editor == "active-editor") refreshPreview({ force: (Editor.settings.get("automatic-refresh") != false) });
}
function closeEditor({ identifier = Editor.active_editor } = {}){
  if (!identifier) return;
  var { tab, container, textarea, getName } = Editor.query(identifier),
    previewOption = /** @type { Option } */ (preview_menu.main.querySelector(`.option[data-editor-identifier="${identifier}"]`)),
    active = (tab.classList.contains("active")),
    focused = (document.activeElement == container),
    editorTabs = Array.from(workspace_tabs.querySelectorAll(".tab:not([data-editor-change])"));
  if (tab.hasAttribute("data-editor-unsaved")){
    if (!confirm(`Are you sure you would like to close "${getName()}"?\nRecent changes have not yet been saved.`)) return;
  }
  var changeIdentifier = Math.random().toString();
  if (editorTabs.length != 1){
    document.body.setAttribute("data-editor-change",changeIdentifier);
    tab.style.setProperty("--tab-margin-right",`-${tab.offsetWidth}px`);
  } else if (document.body.hasAttribute("data-editor-change")){
    document.body.removeAttribute("data-editor-change");
    workspace_tabs.querySelectorAll(".tab[data-editor-change]").forEach(tab => workspace_tabs.removeChild(tab));
  }
  var transitionDuration = (document.body.hasAttribute("data-editor-change")) ? parseInt(getElementStyle({ element: workspace_tabs, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000 : 0;
  if (tab == editorTabs[0] && editorTabs.length == 1){
    Editor.active_editor = null;
    setTitle({ reset: true });
    preview.src = "about:blank";
  }
  if (Editor.preview_editor == identifier) setPreviewSource({ active_editor: true });
  if (tab == editorTabs[0] && editorTabs[1] && tab.classList.contains("active")) openEditor({ identifier: /** @type { string } */ (editorTabs[1].getAttribute("data-editor-identifier")) });
  if (tab == editorTabs[editorTabs.length - 1] && tab != editorTabs[0] && tab.classList.contains("active")) openEditor({ identifier: /** @type { string } */ (editorTabs[editorTabs.length - 2].getAttribute("data-editor-identifier")) });
  if (tab != editorTabs[0] && tab.classList.contains("active")) openEditor({ identifier: /** @type { string } */ (editorTabs[editorTabs.indexOf(tab) + 1].getAttribute("data-editor-identifier")) });
  if (focused && Editor.query().textarea) Editor.query().container.focus({ preventScroll: true });
  tab.setAttribute("data-editor-change","");
  if (tab == document.activeElement) tab.blur();
  tab.tabIndex = -1;
  if (tab.classList.contains("active")) tab.classList.remove("active");
  workspace_editors.removeChild(container);
  preview_menu.main.removeChild(previewOption);
  (transitionDuration) ? window.setTimeout(removeEditorTab,transitionDuration) : removeEditorTab();
  if (Editor.file_handles[identifier]) delete Editor.file_handles[identifier];
  function removeEditorTab(){
    if (workspace_tabs.contains(tab)) workspace_tabs.removeChild(tab);
    if (document.body.getAttribute("data-editor-change") == changeIdentifier) document.body.removeAttribute("data-editor-change");
  }
}
/**
 * @param { { name?: string; identifier?: string | null | undefined; } | undefined } options
*/
function renameEditor({ name, identifier = Editor.active_editor } = {}){
  const { tab, container, getName } = Editor.query(identifier),
    editorName = /** @type { HTMLSpanElement } */ (tab.querySelector("[data-editor-name]")),
    previewOption = /** @type { Option } */ (preview_menu.main.querySelector(`.option[data-editor-identifier="${identifier}"]`)),
    currentName = /** @type { string } */ (getName()),
    base = getName("base"),
    extension = getName("extension");
  let rename = (name) ? name : prompt(`Enter a new file name for "${currentName}".`,currentName);

  if (!rename) return;
  if (!rename.includes(".")){
    rename = `${rename}.${extension}`;
  } else if (rename.charAt(0) == ".") rename = `${base}${rename}`;
  editorName.innerText = rename;
  previewOption.innerText = rename;
  var syntaxLanguage = /** @type { string } */ (Editor.query(identifier).getName("extension"));
  if (syntaxLanguage in Prism.languages) container.syntaxLanguage = syntaxLanguage;
  ((Editor.settings.get("syntax-highlighting") == true) && (syntaxLanguage in Prism.languages)) ? container.syntaxHighlight.enable() : container.syntaxHighlight.disable();
  if (syntaxLanguage != container.syntaxLanguage) container.syntaxLanguage = syntaxLanguage;
  if (tab.hasAttribute("data-editor-auto-created")) tab.removeAttribute("data-editor-auto-created");
  if (tab == Editor.query().tab) setTitle({ content: rename });
  if ((Editor.preview_editor == "active-editor" && Editor.active_editor == identifier) || Editor.preview_editor == identifier) refreshPreview({ force: true });
  return rename;
}
/* Future feature: Add support to disable the wrapping behavior */
function getPreviousEditor({ identifier = Editor.active_editor, wrap = true } = {}){
  var { tab } = Editor.query(identifier),
    editorTabs = Array.from(workspace_tabs.querySelectorAll(".tab:not([data-editor-change])")),
    previousTab = editorTabs[(editorTabs.indexOf(tab) || editorTabs.length) - 1],
    previousEditor = previousTab.getAttribute("data-editor-identifier");
  return previousEditor;
}
function getNextEditor({ identifier = Editor.active_editor, wrap = true } = {}){
  var { tab } = Editor.query(identifier),
    editorTabs = Array.from(workspace_tabs.querySelectorAll(".tab:not([data-editor-change])")),
    nextTab = editorTabs[(editorTabs.indexOf(tab) != editorTabs.length - 1) ? editorTabs.indexOf(tab) + 1 : 0],
    nextEditor = nextTab.getAttribute("data-editor-identifier");
  return nextEditor;
}
function setEditorTabsVisibility({ identifier = Editor.active_editor } = {}){
  if (!Editor.active_editor) return;
  var { tab } = Editor.query(identifier), obstructedLeft = (tab.offsetLeft <= workspace_tabs.scrollLeft), obstructedRight = ((tab.offsetLeft + tab.clientWidth) >= (workspace_tabs.scrollLeft + workspace_tabs.clientWidth)), spacingOffset = 0;
  if ((workspace_tabs.clientWidth < tab.clientWidth) && !obstructedLeft) return;
  if (obstructedLeft){
    spacingOffset = parseInt(getElementStyle({ element: workspace_tabs, pseudo: "::before", property: "width" }),10) * 3;
    workspace_tabs.scrollTo(tab.offsetLeft - spacingOffset,0);
  } else if (obstructedRight){
    spacingOffset = parseInt(getElementStyle({ element: workspace_tabs, pseudo: "::after", property: "width" }),10) * 3;
    workspace_tabs.scrollTo(tab.offsetLeft + tab.clientWidth + spacingOffset - workspace_tabs.clientWidth,0);
  }
}
/**
 * @param { { type: string; force?: boolean; } } options
*/
function setView({ type, force = false }){
  if ((Editor.orientation_change && !force) || Editor.scaling_change) return;
  var changeIdentifier = Math.random().toString();
  document.body.setAttribute("data-view-change",changeIdentifier);
  var transitionDuration = parseInt(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000;
  document.body.classList.remove(Editor.view);
  document.body.setAttribute("data-view",type);
  document.body.classList.add(Editor.view);
  removeScaling();
  view_menu.select(Editor.view);
  if (type != "preview") window.setTimeout(setEditorTabsVisibility,transitionDuration);
  window.setTimeout(() => {
    if (document.body.getAttribute("data-view-change") == changeIdentifier) document.body.removeAttribute("data-view-change");
  },transitionDuration);
  refreshPreview();
}
/**
 * @param { "horizontal" | "vertical" } [orientation]
*/
function setOrientation(orientation){
  if (Editor.orientation_change || Editor.scaling_change) return;
  document.body.setAttribute("data-orientation-change","");
  var param = (orientation), transitionDuration = ((Editor.view != "split") ? 0 : parseInt(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000);
  if (!param && Editor.view == "split") setView({ type: "code", force: true });
  if (!param && Editor.orientation == "horizontal") orientation = "vertical";
  if (!param && Editor.orientation == "vertical") orientation = "horizontal";
  window.setTimeout(() => {
    setTransitionDurations("off");
    document.body.classList.remove(Editor.orientation);
    document.body.setAttribute("data-orientation",/** @type { string } */ (orientation));
    document.body.classList.add(Editor.orientation);
    workspace.offsetHeight;
    scaler.offsetHeight;
    preview.offsetHeight;
    setTransitionDurations("on");
    if (!param) setView({ type: "split", force: true });
    window.setTimeout(() => document.body.removeAttribute("data-orientation-change"),transitionDuration);
  },transitionDuration);
  /**
   * @param { "on" | "off" } state
  */
  function setTransitionDurations(state){
    if (state == "on"){
      workspace.style.removeProperty("transition-duration");
      scaler.style.removeProperty("transition-duration");
      preview.style.removeProperty("transition-duration");
    }
    if (state == "off"){
      workspace.style.transitionDuration = "0s";
      scaler.style.transitionDuration = "0s";
      preview.style.transitionDuration = "0s";
    }
  }
}
/**
 * @param { { identifier?: string; active_editor?: boolean; } } options
*/
function setPreviewSource({ identifier, active_editor }){
  if (!identifier && !active_editor) return;
  if ((!identifier && active_editor) || (Editor.preview_editor == identifier)){
    Editor.preview_editor = "active-editor";
    preview_menu.select("active-editor");
  } else Editor.preview_editor = /** @type { string } */ (identifier);
  refreshPreview({ force: true });
}
/**
 * @param { boolean } state
*/
function setSyntaxHighlighting(state){
  state = (state != undefined) ? state : (Editor.settings.get("syntax-highlighting") != undefined);
  /** @type { NodeListOf<NumTextElement> } */ (document.querySelectorAll("num-text")).forEach(editor => {
    if (editor.syntaxLanguage in Prism.languages) (state) ? editor.syntaxHighlight.enable() : editor.syntaxHighlight.disable();
  });
  Editor.settings.set("syntax-highlighting",String(state));
}
function createWindow(){
  const features = (Editor.appearance.standalone || Editor.appearance.fullscreen) ? "popup" : "",
    win = window.open(window.location.href,"_blank",features);

  if (win === null) throw new Error("Couldn't create a new Smart Text Editor window");
  if (Editor.appearance.fullscreen){
    win.resizeTo(window.screen.width * 2/3,window.screen.height * 2/3);
    win.moveTo(window.screen.width / 6,window.screen.height / 6);
  } else if (Editor.appearance.standalone){
    win.resizeTo(window.outerWidth,window.outerHeight);
    win.moveTo(window.screenX,window.screenY);
  }
}
async function openFiles(){
  if (!Editor.support.file_system){
    var input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.addEventListener("change",() => Array.from(input.files ?? []).forEach(file => {
      var reader = new FileReader();
      reader.readAsText(file,"UTF-8");
      reader.addEventListener("loadend",() => createEditor({ name: file.name, value: /** @type { string } */ (reader.result) }));
    }));
    input.click();
  } else {
    var handles = await window.showOpenFilePicker({ multiple: true }).catch(error => {
      if (error.message.toLowerCase().includes("abort")) return;
    });
    if (!handles) return;
    handles.forEach(async handle => {
      var file = await handle.getFile(), identifier = createEditor({ name: file.name, value: await file.text() });
      Editor.file_handles[identifier] = handle;
    });
  }
}
/**
 * @param { string } [extension]
*/
async function saveFile(extension){
  if (extension || !Editor.support.file_system){
    if (!extension) extension = Editor.query().getName("extension") ?? "";
    var anchor = document.createElement("a"), link = window.URL.createObjectURL(new Blob([Editor.query().textarea?.value ?? ""]));
    anchor.href = link;
    anchor.download = `${Editor.query().getName("base")}.${extension}`;
    anchor.click();
    window.URL.revokeObjectURL(link);
  } else {
    var identifier = Editor.active_editor, handle;
    if (identifier === null) throw new Error("No editors are open, couldn't save anything!");
    if (!Editor.file_handles[identifier]){
      handle = await window.showSaveFilePicker({ suggestedName: /** @type { string } */ (Editor.query().getName()), startIn: (Editor.file_handles[identifier]) ? Editor.file_handles[identifier] : "desktop" }).catch(error => {
        if (error.message.toLowerCase().includes("abort")) return;
      });
      if (!handle) return;
      Editor.file_handles[identifier] = handle;
    } else handle = Editor.file_handles[identifier];
    var stream = await Editor.file_handles[identifier].createWritable().catch(error => {
      alert(`"${Editor.query().getName()}" could not be saved.`);
      if (error.toString().toLowerCase().includes("not allowed")) return;
    });
    if (!stream) return;
    await stream.write(Editor.query().textarea?.value ?? "");
    await stream.close();
    var currentName = Editor.query().getName(), file = await handle.getFile(), rename = file.name;
    if (currentName != rename) renameEditor({ name: rename });
  }
  if (Editor.query().tab.hasAttribute("data-editor-auto-created")) Editor.query().tab.removeAttribute("data-editor-auto-created");
  if (Editor.query().tab.hasAttribute("data-editor-unsaved")) Editor.query().tab.removeAttribute("data-editor-unsaved");
  refreshPreview({ force: true });
}
function createDisplay(){
  var width = window.screen.availWidth * 2/3,
    height = window.screen.availHeight * 2/3,
    left = window.screen.availWidth / 2 + window.screen.availLeft - width / 2,
    top = window.screen.availHeight / 2 + window.screen.availTop - height / 2,
    features = (Editor.appearance.standalone || Editor.appearance.fullscreen) ? "popup" : "",
    baseURL = Editor.settings.get("preview-base") || null,
    source = Editor.query().textarea?.value ?? "";
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  var link = window.URL.createObjectURL(new Blob([source],{ type: "text/html" })),
    win = window.open(link,"_blank",features);

  if (win === null) throw new Error("Couldn't create a display window!");
  window.URL.revokeObjectURL(link);
  win.moveTo(left,top);
  win.resizeTo(width,height);
  Editor.child_windows.push(win);
  window.setTimeout(() => {
    if (win === null) return;
    if (!win.document.title) win.document.title = /** @type { string } */ (Editor.query().getName());
  },20);
}
/**
 * @param { HTMLElement } element
 * @param { string } action
*/
async function callCommand(element,action){/* I think I may remove this, or do something else with it. document.execCommand() is broken in so many ways, what a shame */
  element.focus({ preventScroll: true });
  if (action == "paste"){
    var clipboard = await navigator.clipboard.readText().catch(() => alert("Could not access the clipboard, please check site permissions for clipboard use."));
    if (clipboard === undefined) return;
    document.execCommand("insertText",false,clipboard);
  } else document.execCommand(action);
}
/**
 * @param { { container: HTMLElement; scope?: boolean | string; } } options
*/
function getNavigableElements({ container, scope = false }){
  scope = (scope) ? "" : ":scope > ";
  /** @type { NodeListOf<HTMLElement> } */
  var navigable = container.querySelectorAll(`${scope}button:not([disabled]), ${scope}textarea:not([disabled]), ${scope}input:not([disabled]), ${scope}select:not([disabled]), ${scope}a[href]:not([disabled]), ${scope}[tabindex]:not([tabindex="-1"])`);
  return Array.from(navigable).filter(element => (getElementStyle({ element, property: "display" }) != "none"));
}
/**
 * @param { { element: Element; pseudo?: string | null; property: string; } } options
*/
function getElementStyle({ element, pseudo = null, property }){
  return window.getComputedStyle(element,pseudo).getPropertyValue(property);
}
/**
 * @param { { element: HTMLInputElement | NumTextElement; } } options
*/
function applyEditingBehavior({ element }){
  var type = element.tagName.toLowerCase();
  /** @type { HTMLElement } */ (element).addEventListener("dragover",event => {
    event.stopPropagation();
    if (event.dataTransfer === null) return;
    event.dataTransfer.dropEffect = "copy";
  });
  /** @type { HTMLElement } */ (element).addEventListener("drop",event => {
    if (event.dataTransfer === null) return;
    if (Array.from(event.dataTransfer.items)[0].kind == "file") return;
    event.stopPropagation();
    /** @type { NodeListOf<MenuDropElement> } */ (document.querySelectorAll("menu-drop[data-open]")).forEach(menu => menu.close());
  });
  if (type == "input"){
    element.spellcheck = false;
    // @ts-expect-error
    element.autocomplete = "off";
    element.autocapitalize = "none";
    element.setAttribute("autocorrect","off");
  }
  if (type == "num-text"){
    if (!(element instanceof NumTextElement)) return;
    element.colorScheme.set("dark");
    element.themes.remove("vanilla-appearance");
    var scrollbarStyles = document.createElement("style");
    scrollbarStyles.textContent = scrollbar_styles.textContent;
    element.shadowRoot?.insertBefore(scrollbarStyles,element.container);
  }
}
/**
 * @param { { control?: boolean; command?: boolean; shift?: boolean; controlShift?: boolean; shiftCommand?: boolean; controlCommand?: boolean; key: string; } } options
*/
function sendShortcutAction({ control, command, shift, controlShift, shiftCommand, controlCommand, key }){
  if (!key) return;
  var appleDevice = (Editor.environment.apple_device);

  control = ((control && !appleDevice) || (controlShift && !appleDevice) || (controlCommand && appleDevice));
  command = ((command && appleDevice) || (shiftCommand && appleDevice) || (controlCommand && appleDevice));
  shift = (shift || (controlShift && !appleDevice) || (shiftCommand && appleDevice));
  key = key.toString().toLowerCase();

  document.body.dispatchEvent(new KeyboardEvent("keydown",{ ctrlKey: control, metaKey: command, shiftKey: shift, key }));
}
function refreshPreview({ force = false } = {}){
  if (Editor.view == "code") return;
  var editor = (Editor.preview_editor == "active-editor") ? Editor.query() : Editor.query(Editor.preview_editor);
  if (!editor.textarea) return;
  var change = (editor.tab.hasAttribute("data-editor-refresh") && Editor.settings.get("automatic-refresh") != false);
  if (!change && !force) return;
  var baseURL = Editor.settings.get("preview-base") || null, source = editor.textarea.value;
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  preview.addEventListener("load",() => {
    preview.contentWindow?.document.open();
    preview.contentWindow?.document.write(source);
    preview.contentWindow?.document.close();
  },{ once: true });
  preview.src = "about:blank";
  if (change) editor.tab.removeAttribute("data-editor-refresh");
}
/**
 * @param { { content?: string; reset?: boolean; } | undefined } options
*/
function setTitle({ content = "", reset = false } = {}){
  document.title = `${(content && !reset) ? `${content} - ` : ""}Smart Text Editor`;
}
/**
 * @param { string[] } entries
*/
function addQueryParameters(entries){
  var parameters = new URLSearchParams(window.location.search);
  entries.forEach(entry => parameters.set(entry,""));
  changeQueryParameters(parameters);
}
/**
 * @param { string[] } entries
*/
function removeQueryParameters(entries){
  var parameters = new URLSearchParams(window.location.search);
  entries.forEach(entry => parameters.delete(entry));
  changeQueryParameters(parameters);
}
/**
 * @param { URLSearchParams } parameters
*/
function changeQueryParameters(parameters){
  var query = parameters.toString();
  if (query) query = "?" + query;
  var address = window.location.pathname + query;
  history.pushState(null,"",address);
}
function showInstallPrompt(){
  if (Editor.install_prompt === null) return;
  Editor.install_prompt.prompt();
  Editor.install_prompt.userChoice.then(result => {
    if (result.outcome != "accepted") return;
    document.documentElement.classList.remove("install-prompt-available");
    theme_button.childNodes[0].textContent = "Customize Theme";
  });
}
function clearSiteCaches(){
  if (navigator.serviceWorker.controller === null) return;
  if (confirm("Are you sure you would like to clear all app caches?\nSmart Text Editor will no longer work offline until an Internet connection is available.")) navigator.serviceWorker.controller.postMessage({ action: "clear-site-caches" });
}
/**
 * @param { MouseEvent | TouchEvent } event
*/
function setScaling(event){
  var { safe_area_insets: safeAreaInsets } = Editor.appearance,
    scalingOffset,
    scalingRange = { minimum: ((Editor.orientation == "vertical") ? workspace_tabs.offsetHeight : safeAreaInsets.left) + 80,
    maximum: ((Editor.orientation == "horizontal") ? window.innerWidth - safeAreaInsets.right : (Editor.orientation == "vertical") ? (window.innerHeight - header.offsetHeight - safeAreaInsets.bottom) : 0) - 80 },
    touchEvent = (Editor.environment.touch_device && event instanceof TouchEvent);
  if (Editor.orientation == "horizontal") scalingOffset = (!touchEvent) ? /** @type { MouseEvent } */ (event).pageX : /** @type { TouchEvent } */ (event).touches[0].pageX;
  if (Editor.orientation == "vertical") scalingOffset = (!touchEvent) ? /** @type { MouseEvent } */ (event).pageY - header.offsetHeight : /** @type { TouchEvent } */ (event).touches[0].pageY - header.offsetHeight;
  if (/** @type { number } */ (scalingOffset) < scalingRange.minimum) scalingOffset = scalingRange.minimum;
  if (/** @type { number } */ (scalingOffset) > scalingRange.maximum) scalingOffset = scalingRange.maximum;
  document.body.setAttribute("data-scaling-active","");
  workspace.style.setProperty("--scaling-offset",`${scalingOffset}px`);
  scaler.style.setProperty("--scaling-offset",`${scalingOffset}px`);
  preview.style.setProperty("--scaling-offset",`${scalingOffset}px`);
}
/**
 * @param { MouseEvent | TouchEvent } event
*/
function disableScaling(event){
  var touchEvent = (Editor.environment.touch_device && event instanceof TouchEvent);
  document.removeEventListener((!touchEvent) ? "mousemove" : "touchmove",setScaling);
  document.removeEventListener((!touchEvent) ? "mouseup" : "touchend",disableScaling);
  document.body.removeAttribute("data-scaling-change");
}
function removeScaling(){
  if (!document.body.hasAttribute("data-scaling-active")) return;
  document.body.removeAttribute("data-scaling-active");
  workspace.style.removeProperty("--scaling-offset");
  scaler.style.removeProperty("--scaling-offset");
  preview.style.removeProperty("--scaling-offset");
}