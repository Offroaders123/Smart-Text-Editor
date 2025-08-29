/**
 * A namespace of properties that query the app's environment.
*/
export const environment = {
  /**
   * Checks if the app is running on a touch-supported device.
  */
  get touchDevice(): boolean {
    return ("ontouchstart" in window);
  },

  /**
   * Checks if the app is running on an Apple device.
  */
  get appleDevice(): boolean {
    return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(navigator.userAgentData?.platform ?? navigator.platform));
  },

  /**
   * Checks if the app is running on a macOS device.
  */
  get macOSDevice(): boolean {
    return (/(macOS|Mac)/i.test(navigator.userAgentData?.platform ?? navigator.platform) && navigator.maxTouchPoints < 1);
  },

  /**
   * Checks if the app is running in a Firefox-based browser.
  */
  get mozillaBrowser(): boolean {
    return (CSS.supports("-moz-appearance: none"));
  }
}
