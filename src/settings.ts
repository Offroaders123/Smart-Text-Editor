import { appearance } from "./appearance.js";
import { setPreviewBase } from "./app.js";
import { openCard } from "./card/Card.js";

import type { Orientation } from "./workspace/Workspace.js";

interface ResetSettingsOptions {
  confirm?: boolean;
}

/**
 * A namespace of functions to work with the app's settings.
*/
export const settings = {
  get defaultOrientation(): Orientation | null {
    return localStorage.getItem("defaultOrientation") as Orientation | null;
  },

  set defaultOrientation(value) {
    if (value === null){
      localStorage.removeItem("defaultOrientation");
      return;
    }
    localStorage.setItem("defaultOrientation",value);
  },

  get syntaxHighlighting(): boolean | null {
    const value = localStorage.getItem("syntaxHighlighting");
    if (value === null) return value;
    return JSON.parse(value) === true;
  },

  set syntaxHighlighting(value) {
    if (value === null){
      localStorage.removeItem("syntaxHighlighting");
      return;
    }
    localStorage.setItem("syntaxHighlighting",`${value}`);
  },

  get automaticRefresh(): boolean | null {
    const value = localStorage.getItem("automaticRefresh");
    if (value === null) return value;
    return JSON.parse(value) === true;
  },

  set automaticRefresh(value) {
    if (value === null){
      localStorage.removeItem("automaticRefresh");
      return;
    }
    localStorage.setItem("automaticRefresh",`${value}`);
  },

  get previewBase(): string | null {
    return localStorage.getItem("previewBase");
  },

  set previewBase(value) {
    if (value === null){
      localStorage.removeItem("previewBase");
      return;
    }
    localStorage.setItem("previewBase",value);
  },

  /**
   * Removes all key-value pairs from the app's settings.
   * 
   * @param options Accepts an option to show the user a prompt to confirm that the settings should be reset.
  */
  reset({ confirm: showPrompt = false }: ResetSettingsOptions = {}): boolean {
    if (showPrompt){
      if (!confirm("Are you sure you would like to reset all settings?")) return false;
    }

    this.defaultOrientation = null;
    default_orientation_setting.select("horizontal");
    appearance.setSyntaxHighlighting(false);

    this.syntaxHighlighting = null;
    syntax_highlighting_setting.checked = false;

    this.automaticRefresh = null;
    automatic_refresh_setting.checked = true;

    this.previewBase = null;
    setPreviewBase(null);

    if (showPrompt) openCard("reset_settings_card");
    return true;
  }
}
