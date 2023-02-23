import "./Card.js";
import "./Tools.js";
import { createEditor, openEditor, closeEditor, renameEditor, getPreviousEditor, getNextEditor, setEditorTabsVisibility } from "./Editor.js";

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
    createEditor({ auto_replace: false });
  }
  if (((control || command) && pressed("w")) || ((controlShift || shiftCommand) && pressed("d"))){
    if (shift && pressed("w")) return window.close();
    event.preventDefault();
    if (event.repeat) return;
    /* Future feature: If an editor tab is focused, close that editor instead of only the active editor */
    closeEditor();
  }
  if (((controlShift || (event.ctrlKey && shift && !command && STE.environment.appleDevice)) && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("[") || pressed("{")))){
    event.preventDefault();
    if (event.repeat) return;
    // For both of these expected errors, I need to add handling for when there aren't any Editors opened, since it will throw an error trying to open the next editor, when there isn't one there. There's not even one to start from in that case, either!
    // @ts-expect-error
    openEditor({ identifier: getPreviousEditor() });
  }
  if (((control || (event.ctrlKey && !command && STE.environment.appleDevice)) && !shift && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("]") || pressed("}")))){
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
        reader.addEventListener("loadend",() => createEditor({ name: file?.name, value: /** @type { string } */ (reader.result) }));
      } else {
        var handle = await item.getAsFileSystemHandle();
        if (handle === null) return;
        if (handle.kind != "file" || !(handle instanceof FileSystemFileHandle)) return;
        let file = await handle.getFile(), identifier = createEditor({ name: file.name, value: await file.text() });
        STE.fileHandles[identifier] = handle;
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
  if (event.key == "ArrowLeft") STE.query(previousEditor).tab.focus();
  if (event.key == "ArrowRight") STE.query(nextEditor).tab.focus();
});

create_editor_button.addEventListener("keydown",event => {
  if (event.key != "Enter") return;
  if (event.repeat) event.preventDefault();
});

create_editor_button.addEventListener("mousedown",event => event.preventDefault());

create_editor_button.addEventListener("click",() => createEditor({ auto_replace: false }));

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

window.requestAnimationFrame(() => createEditor({ auto_created: true }));

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
      var file = await handle.getFile(), identifier = createEditor({ name: file.name, value: await file.text() });
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
 * Sets the View state of the app. If a View change is already in progress, and the force option is not set to `true`, the call will be skipped.
 * 
 * @param { { type: "code" | "split" | "preview"; force?: boolean; } } options
*/
globalThis.setView = function setView({ type, force = false }){
  if ((STE.orientationChange && !force) || STE.scalingChange) return;
  var changeIdentifier = Math.random().toString();
  document.body.setAttribute("data-view-change",changeIdentifier);
  var transitionDuration = parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`);
  document.body.classList.remove(STE.view);
  document.body.setAttribute("data-view",type);
  document.body.classList.add(STE.view);
  removeScaling();
  view_menu.select(STE.view);
  if (type != "preview") window.setTimeout(setEditorTabsVisibility,transitionDuration);
  window.setTimeout(() => {
    if (document.body.getAttribute("data-view-change") == changeIdentifier) document.body.removeAttribute("data-view-change");
  },transitionDuration);
  refreshPreview();
}

/**
 * Sets the Orientation state of the app. If an Orientation change is already in progress, the call will be skipped.
 * 
 * @param { "horizontal" | "vertical" } [orientation] - If an Orientation type is not provided, the current state will be toggled to the other option.
*/
globalThis.setOrientation = function setOrientation(orientation){
  if (STE.orientationChange || STE.scalingChange) return;
  document.body.setAttribute("data-orientation-change","");
  var param = (orientation), transitionDuration = ((STE.view != "split") ? 0 : parseInt(`${Number(getElementStyle({ element: workspace, property: "transition-duration" }).split(",")[0].replace(/s/g,"")) * 1000}`));
  if (!param && STE.view == "split") setView({ type: "code", force: true });
  if (!param && STE.orientation == "horizontal") orientation = "vertical";
  if (!param && STE.orientation == "vertical") orientation = "horizontal";
  window.setTimeout(() => {
    setTransitionDurations("off");
    document.body.classList.remove(STE.orientation);
    document.body.setAttribute("data-orientation",/** @type { string } */ (orientation));
    document.body.classList.add(STE.orientation);
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
 * Sets the source for the Preview to a given Editor.
 * 
 * @param { { identifier?: string; active_editor?: boolean; } } options
*/
globalThis.setPreviewSource = function setPreviewSource({ identifier, active_editor }){
  if (!identifier && !active_editor) return;
  if ((!identifier && active_editor) || (STE.previewEditor == identifier)){
    STE.previewEditor = "active-editor";
    preview_menu.select("active-editor");
  } else STE.previewEditor = /** @type { string } */ (identifier);
  refreshPreview({ force: true });
}

/**
 * Creates a new Smart Text Editor window.
*/
globalThis.createWindow = function createWindow(){
  const features = (STE.appearance.standalone || STE.appearance.fullscreen) ? "popup" : "",
    win = window.open(window.location.href,"_blank",features);

  if (win === null) throw new Error("Couldn't create a new Smart Text Editor window");
  if (STE.appearance.fullscreen){
    win.resizeTo(window.screen.width * 2/3,window.screen.height * 2/3);
    win.moveTo(window.screen.width / 6,window.screen.height / 6);
  } else if (STE.appearance.standalone){
    win.resizeTo(window.outerWidth,window.outerHeight);
    win.moveTo(window.screenX,window.screenY);
  }
}

/**
 * Creates new Editors in the Workspace from files chosen by the user through a file system file picker.
 * 
 * If the File System Access API is supported in the user's browser, it will use that. If not, it will fall back to using an `<input type="file">` element.
*/
globalThis.openFiles = async function openFiles(){
  if (!STE.support.fileSystem){
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
      STE.fileHandles[identifier] = handle;
    });
  }
}

/**
 * Saves an Editor as a file back to the user's file system.
 * 
 * If the File System Access API is supported in the user's browser, the Editor's current value will be rewritten directly to the file system.
 * 
 * If the File System Access API is not supported, or if a custom file extension is provided for the current file, a Save As dialog will be shown using an `<a download href="blob:">` element.
 * 
 * @param { string } [extension]
*/
globalThis.saveFile = async function saveFile(extension){
  if (extension || !STE.support.fileSystem){
    if (!extension) extension = STE.query().getName("extension") ?? "";
    var anchor = document.createElement("a"), link = window.URL.createObjectURL(new Blob([STE.query().textarea?.value ?? ""]));
    anchor.href = link;
    anchor.download = `${STE.query().getName("base")}.${extension}`;
    anchor.click();
    window.URL.revokeObjectURL(link);
  } else {
    var identifier = STE.activeEditor, handle;
    if (identifier === null) throw new Error("No editors are open, couldn't save anything!");
    if (!STE.fileHandles[identifier]){
      handle = await window.showSaveFilePicker({ suggestedName: /** @type { string } */ (STE.query().getName()), startIn: (STE.fileHandles[identifier]) ? STE.fileHandles[identifier] : "desktop" }).catch(error => {
        if (error.message.toLowerCase().includes("abort")) return;
      });
      if (!handle) return;
      STE.fileHandles[identifier] = handle;
    } else handle = STE.fileHandles[identifier];
    var stream = await STE.fileHandles[identifier].createWritable().catch(error => {
      alert(`"${STE.query().getName()}" could not be saved.`);
      if (error.toString().toLowerCase().includes("not allowed")) return;
    });
    if (!stream) return;
    await stream.write(STE.query().textarea?.value ?? "");
    await stream.close();
    var currentName = STE.query().getName(), file = await handle.getFile(), rename = file.name;
    if (currentName != rename) renameEditor({ name: rename });
  }
  if (STE.query().tab.hasAttribute("data-editor-auto-created")) STE.query().tab.removeAttribute("data-editor-auto-created");
  if (STE.query().tab.hasAttribute("data-editor-unsaved")) STE.query().tab.removeAttribute("data-editor-unsaved");
  refreshPreview({ force: true });
}

/**
 * Creates a new Display window for the active Editor.
*/
globalThis.createDisplay = function createDisplay(){
  var width = window.screen.availWidth * 2/3,
    height = window.screen.availHeight * 2/3,
    left = window.screen.availWidth / 2 + window.screen.availLeft - width / 2,
    top = window.screen.availHeight / 2 + window.screen.availTop - height / 2,
    features = (STE.appearance.standalone || STE.appearance.fullscreen) ? "popup" : "",
    baseURL = STE.settings.get("preview-base") || null,
    source = STE.query().textarea?.value ?? "";
  if (baseURL) source = `<!DOCTYPE html>\n<!-- Document Base URL appended by Smart Text Editor -->\n<base href="${baseURL}">\n\n${source}`;
  var link = window.URL.createObjectURL(new Blob([source],{ type: "text/html" })),
    win = window.open(link,"_blank",features);

  if (win === null) throw new Error("Couldn't create a display window!");
  window.URL.revokeObjectURL(link);
  win.moveTo(left,top);
  win.resizeTo(width,height);
  STE.childWindows.push(win);
  window.setTimeout(() => {
    if (win === null) return;
    if (!win.document.title) win.document.title = /** @type { string } */ (STE.query().getName());
  },20);
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
 * Refreshes the Preview with the latest source from the source Editor.
*/
globalThis.refreshPreview = function refreshPreview({ force = false } = {}){
  if (STE.view == "code") return;
  var editor = (STE.previewEditor == "active-editor") ? STE.query() : STE.query(STE.previewEditor);
  if (!editor.textarea) return;
  var change = (editor.tab.hasAttribute("data-editor-refresh") && STE.settings.get("automatic-refresh") != false);
  if (!change && !force) return;
  var baseURL = STE.settings.get("preview-base") || null, source = editor.textarea.value;
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

/**
 * Sets the Split mode scaling when called from the Scaler's moving event listeners.
 * 
 * @param { MouseEvent | TouchEvent } event
*/
function setScaling(event){
  var { safeAreaInsets: safeAreaInsets } = STE.appearance,
    scalingOffset,
    scalingRange = { minimum: ((STE.orientation == "vertical") ? workspace_tabs.offsetHeight : safeAreaInsets.left) + 80,
    maximum: ((STE.orientation == "horizontal") ? window.innerWidth - safeAreaInsets.right : (STE.orientation == "vertical") ? (window.innerHeight - header.offsetHeight - safeAreaInsets.bottom) : 0) - 80 },
    touchEvent = (STE.environment.touchDevice && event instanceof TouchEvent);
  if (STE.orientation == "horizontal") scalingOffset = (!touchEvent) ? /** @type { MouseEvent } */ (event).pageX : /** @type { TouchEvent } */ (event).touches[0].pageX;
  if (STE.orientation == "vertical") scalingOffset = (!touchEvent) ? /** @type { MouseEvent } */ (event).pageY - header.offsetHeight : /** @type { TouchEvent } */ (event).touches[0].pageY - header.offsetHeight;
  if (/** @type { number } */ (scalingOffset) < scalingRange.minimum) scalingOffset = scalingRange.minimum;
  if (/** @type { number } */ (scalingOffset) > scalingRange.maximum) scalingOffset = scalingRange.maximum;
  document.body.setAttribute("data-scaling-active","");
  workspace.style.setProperty("--scaling-offset",`${scalingOffset}px`);
  scaler.style.setProperty("--scaling-offset",`${scalingOffset}px`);
  preview.style.setProperty("--scaling-offset",`${scalingOffset}px`);
}

/**
 * Removes the Split mode scale handling when the user finishes moving the Scaler.
 * 
 * @param { MouseEvent | TouchEvent } event
*/
function disableScaling(event){
  var touchEvent = (STE.environment.touchDevice && event instanceof TouchEvent);
  document.removeEventListener((!touchEvent) ? "mousemove" : "touchmove",setScaling);
  document.removeEventListener((!touchEvent) ? "mouseup" : "touchend",disableScaling);
  document.body.removeAttribute("data-scaling-change");
}

/**
 * Resets the Split mode scaling offsets, making the Workspace responsive again.
*/
function removeScaling(){
  if (!document.body.hasAttribute("data-scaling-active")) return;
  document.body.removeAttribute("data-scaling-active");
  workspace.style.removeProperty("--scaling-offset");
  scaler.style.removeProperty("--scaling-offset");
  preview.style.removeProperty("--scaling-offset");
}