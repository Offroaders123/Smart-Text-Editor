import "./Card.js";
import Tools from "./Tools.js";
import { Editor, getPreviousEditor, getNextEditor, setEditorTabsVisibility } from "./Editor.js";
import { setView, setOrientation, createWindow, openFiles, saveFile, createDisplay, refreshPreview, setScaling, disableScaling } from "./Workspace.js";

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

window.addEventListener("load",() => {
  if (STE.environment.fileProtocol) return;
  if (window.location.href.includes("index.html")) history.pushState(null,"",window.location.href.replace(/index.html/,""));
  if (!("serviceWorker" in navigator) || !STE.appearance.parentWindow) return;
  navigator.serviceWorker.register("service-worker.js").then(() => {
    if ((navigator.serviceWorker.controller) ? (navigator.serviceWorker.controller.state == "activated") : false) activateManifest();
    navigator.serviceWorker.addEventListener("message",event => {
      if (event.data.action == "service-worker-activated") activateManifest();
      if (event.data.action == "clear-site-caches-complete") cleared_cache_card.open();
      if (event.data.action == "share-target"){
        event.data.files.forEach(/** @param { File } file */ file => {
          var reader = new FileReader();
          reader.readAsText(file,"UTF-8");
          reader.addEventListener("loadend",() => new Editor({ name: file.name, value: /** @type { string } */ (reader.result) }));
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
  STE.installPrompt = event;
  document.documentElement.classList.add("install-prompt-available");
  theme_button.childNodes[0].textContent = "Theme";
});

window.addEventListener("beforeunload",event => {
  if (STE.unsavedWork) return;
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("unload",() => STE.childWindows.forEach(window => window.close()));

window.addEventListener("resize",event => {
  STE.appearance.refreshDevicePixelRatio();
  if (STE.view != "preview") setEditorTabsVisibility();
  if (STE.view == "split" && document.body.hasAttribute("data-scaling-active")) setView({ type: "split" });
});

window.addEventListener("blur",() => {
  if (STE.appearance.parentWindow) /** @type { NodeListOf<MenuDropElement> } */ (document.querySelectorAll("menu-drop[data-open]")).forEach(menu => menu.close());
});

if (STE.support.windowControlsOverlay) navigator.windowControlsOverlay.addEventListener("geometrychange",() => STE.appearance.refreshWindowControlsOverlay());

document.body.addEventListener("keydown",event => {
  /**
   * @param { string } key
  */
  var pressed = key => (event.key.toLowerCase() == key.toLowerCase()),
    control = (event.ctrlKey && !STE.environment.appleDevice),
    command = (event.metaKey && STE.environment.appleDevice),
    shift = (event.shiftKey || ((event.key.toUpperCase() == event.key) && (event.key + event.key == String(Number(event.key) * 2)))),
    controlShift = (control && shift),
    shiftCommand = (shift && command),
    controlCommand = (event.ctrlKey && command);

  if (pressed("Escape")){
    event.preventDefault();
    if (event.repeat) return;
    if (STE.activeDialog && !document.activeElement?.matches("menu-drop[data-open]")) STE.activeDialog.close();
  }
  if (((control || command) && !shift && pressed("n")) || ((controlShift || shiftCommand) && pressed("x"))){
    event.preventDefault();
    if (event.repeat) return;
    new Editor({ autoReplace: false });
  }
  if (((control || command) && pressed("w")) || ((controlShift || shiftCommand) && pressed("d"))){
    if (shift && pressed("w")) return window.close();
    event.preventDefault();
    if (event.repeat) return;
    /* Future feature: If an editor tab is focused, close that editor instead of only the active editor */
    if (STE.activeEditor !== null){
      Editor.close(STE.activeEditor);
    }
  }
  if (((controlShift || (event.ctrlKey && shift && !command && STE.environment.appleDevice)) && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("[") || pressed("{")))){
    event.preventDefault();
    if (event.repeat) return;
    // For both of these expected errors, I need to add handling for when there aren't any Editors opened, since it will throw an error trying to open the next editor, when there isn't one there. There's not even one to start from in that case, either!
    // @ts-expect-error
    Editor.open(getPreviousEditor);
  }
  if (((control || (event.ctrlKey && !command && STE.environment.appleDevice)) && !shift && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("]") || pressed("}")))){
    event.preventDefault();
    if (event.repeat) return;
    // @ts-expect-error
    Editor.open(getNextEditor);
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
    if (STE.activeEditor !== null){
      Editor.rename(STE.activeEditor);
    }
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
    if (event.repeat || !STE.activeWidget) return;
    if (STE.activeWidget) STE.activeWidget.minimize();
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
      if (!STE.support.fileSystem || !("getAsFileSystemHandle")){
        var file = item.getAsFile(), reader = new FileReader();
        if (file === null) return;
        reader.readAsText(file,"UTF-8");
        reader.addEventListener("loadend",() => new Editor({ name: file?.name, value: /** @type { string } */ (reader.result) }));
      } else {
        var handle = await item.getAsFileSystemHandle();
        if (handle === null) return;
        if (handle.kind != "file" || !(handle instanceof FileSystemFileHandle)) return;
        let file = await handle.getFile(), { identifier } = new Editor({ name: file.name, value: await file.text() });
        STE.fileHandles[identifier] = handle;
      }
    } else if (item.kind == "string" && index == 0 && event.dataTransfer?.getData("text") != "") new Editor({ value: event.dataTransfer?.getData("text") });
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
  if (event.key == "ArrowLeft") STE.query(previousEditor).tab.focus();
  if (event.key == "ArrowRight") STE.query(nextEditor).tab.focus();
});

create_editor_button.addEventListener("keydown",event => {
  if (event.key != "Enter") return;
  if (event.repeat) event.preventDefault();
});

create_editor_button.addEventListener("mousedown",event => event.preventDefault());

create_editor_button.addEventListener("click",() => new Editor({ autoReplace: false }));

scaler.addEventListener("mousedown",event => {
  if (event.button != 0) return;
  if (STE.view != "split") return;
  event.preventDefault();
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("mousemove",setScaling);
  document.addEventListener("mouseup",disableScaling);
});

scaler.addEventListener("touchstart",event => {
  if (STE.view != "split" || event.touches.length != 1) return;
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("touchmove",setScaling,{ passive: true });
  document.addEventListener("touchend",disableScaling,{ passive: true });
},{ passive: true });

card_backdrop.addEventListener("click",() => {
  if (STE.activeDialog === null) return;
  STE.activeDialog.close();
});

preview_base_input.placeholder = document.baseURI;

preview_base_input.setWidth = () => preview_base_input.style.setProperty("--input-count",preview_base_input.value.length.toString());

preview_base_input.setValue = value => {
  preview_base_input.value = value;
  preview_base_input.setWidth();
};

preview_base_input.reset = () => {
  preview_base_input.setValue("");
  if (!STE.settings.has("preview-base")) return;
  STE.settings.remove("preview-base");
  refreshPreview({ force: true });
};

preview_base_input.style.setProperty("--placeholder-count",preview_base_input.placeholder.length.toString());

preview_base_input.addEventListener("input",event => /** @type { typeof preview_base_input } */ (event.target).setWidth());

preview_base_input.addEventListener("change",event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  var empty = event.target.matches(":placeholder-shown"), valid = event.target.matches(":valid");
  if (empty || !valid) STE.settings.remove("preview-base");
  if (!empty && valid) STE.settings.set("preview-base",event.target.value);
  if (empty || valid) refreshPreview({ force: true });
});

generator_output.addEventListener("click",() => generator_output.select());

generator_output.addEventListener("keydown",() => generator_output.click());

window.requestAnimationFrame(() => new Editor({ autoCreated: true }));

if (STE.appearance.parentWindow){
  if (STE.settings.get("default-orientation")){
    var value = STE.settings.get("default-orientation");
    window.requestAnimationFrame(() => default_orientation_setting.select(value));
    setOrientation(value);
  }
  if (STE.settings.get("syntax-highlighting") != undefined){
    var state = STE.settings.get("syntax-highlighting");
    STE.appearance.setSyntaxHighlighting(state);
    syntax_highlighting_setting.checked = state;
  }
  if (STE.settings.get("automatic-refresh") != undefined) automatic_refresh_setting.checked = STE.settings.get("automatic-refresh");
  if (STE.settings.get("preview-base")) preview_base_input.setValue(STE.settings.get("preview-base"));
  window.setTimeout(() => document.documentElement.classList.remove("startup-fade"),50);
}

if (STE.support.fileHandling && STE.support.fileSystem){
  window.launchQueue.setConsumer(params => {
    params.files.forEach(async handle => {
      var file = await handle.getFile(), { identifier } = new Editor({ name: file.name, value: await file.text() });
      STE.fileHandles[identifier] = handle;
    });
    if (!STE.environment.touchDevice) STE.query().container.focus({ preventScroll: true });
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

/**
 * Gets a style property value for a given element.
 * 
 * @param { { element: Element; pseudo?: string | null; property: string; } } options
*/
export function getElementStyle({ element, pseudo = null, property }){
  return window.getComputedStyle(element,pseudo).getPropertyValue(property);
}

/**
 * Applies the app's behavior defaults, like Drag and Drop handling, to `<input>` and `<num-text>` elements.
 * 
 * @param { { element: HTMLInputElement | NumTextElement; } } options
*/
export function applyEditingBehavior({ element }){
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
 * Sets the title of the window.
 * 
 * @param { { content?: string; reset?: boolean; } | undefined } options
*/
export function setTitle({ content = "", reset = false } = {}){
  document.title = `${(content && !reset) ? `${content} - ` : ""}Smart Text Editor`;
}

/**
 * Removes query parameters from the app's URL.
 * 
 * @param { string[] } entries
*/
function removeQueryParameters(entries){
  var parameters = new URLSearchParams(window.location.search);
  entries.forEach(entry => parameters.delete(entry));
  changeQueryParameters(parameters);
}

/**
 * Updates the app's URL query parameters to a new `URLSearchParams` object.
 * 
 * @param { URLSearchParams } parameters
*/
function changeQueryParameters(parameters){
  var query = parameters.toString();
  if (query) query = "?" + query;
  var address = window.location.pathname + query;
  history.pushState(null,"",address);
}

/**
 * Shows the PWA Install Prompt, if the `BeforeInstallPrompt` event was fired when the app first started.
*/
globalThis.showInstallPrompt = function showInstallPrompt(){
  if (STE.installPrompt === null) return;
  STE.installPrompt.prompt();
  STE.installPrompt.userChoice.then(result => {
    if (result.outcome != "accepted") return;
    document.documentElement.classList.remove("install-prompt-available");
    theme_button.childNodes[0].textContent = "Customize Theme";
  });
}

/**
 * Clears the Service Worker cache, if the user confirms doing so.
*/
globalThis.clearSiteCaches = function clearSiteCaches(){
  if (navigator.serviceWorker.controller === null) return;
  if (confirm("Are you sure you would like to clear all app caches?\nSmart Text Editor will no longer work offline until an Internet connection is available.")) navigator.serviceWorker.controller.postMessage({ action: "clear-site-caches" });
}