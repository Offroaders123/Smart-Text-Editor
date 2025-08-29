import { environment } from "./environment.js";

/**
 * A namespace of properties that query the support of features in the app's current environment.
*/
export const support = {
  /**
   * Queries if the File System Access API is supported.
  */
  get fileSystem(): boolean {
    return ("showOpenFilePicker" in window);
  },

  /**
   * Queries if the File Handling API is supported.
  */
  get fileHandling(): boolean {
    return ("launchQueue" in window && "LaunchParams" in window);
  },

  /**
   * Queries if the Window Controls Overlay API is supported.
  */
  get windowControlsOverlay(): boolean {
    return ("windowControlsOverlay" in navigator);
  },

  /**
   * Queries if `document.execCommand()` calls are supported in `<textarea>` and `<input>` elements.
  */
  get editingCommands(): boolean {
    return (!environment.mozillaBrowser);
  },

  /**
   * Queries if the Web Share API is supported.
  */
  get webSharing(): boolean {
    return ("share" in navigator);
  }
}
