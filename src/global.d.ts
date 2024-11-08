declare global {
  interface Navigator {
    /**
     * Exclusive to iOS, iPadOS, and macOS devices.
    */
    readonly standalone: boolean;
  }

  interface Screen {
    readonly availLeft: number;
    readonly availTop: number;
  }

  var theme_color: HTMLMetaElement; // unused, style feature
  var scrollbar_styles: HTMLStyleElement;
  var theme_styles: HTMLStyleElement; // unused, style feature

  // var header: HTMLElement;

  // var app_menubar: HTMLDivElement;
  var file_menu: MenuDropElement; // styles only
  // var view_menu: MenuDropElement;
  // var preview_menu: MenuDropElement;
  // var tools_menu: MenuDropElement;
  var settings_menu: MenuDropElement; // styles only

  // var app_omnibox: HTMLDivElement;
  var install_option: HTMLButtonElement;

  // var main: HTMLElement;

  // var workspace: HTMLDivElement;
  // var workspace_tabs: HTMLDivElement;
  // var create_editor_button: HTMLButtonElement;
  // var workspace_editors: HTMLDivElement;
  // var scaler: HTMLDivElement;
  // var preview: HTMLIFrameElement;

  var settings_card: HTMLDivElement;
  var default_orientation_setting: MenuDropElement;
  var syntax_highlighting_setting: HTMLInputElement;
  var automatic_refresh_setting: HTMLInputElement;
  var install_button: HTMLButtonElement;
  var theme_button: HTMLButtonElement;
  var clear_site_caches_button: HTMLButtonElement;

  var theme_card: HTMLDivElement;
  var theme_setting: NumTextElement;

  var preview_base_card: HTMLDivElement;

  var reset_settings_card: HTMLDivElement;
  var cleared_cache_card: HTMLDivElement;

  var replace_text_card: HTMLDivElement;

  var color_picker_card: HTMLDivElement;
  var picker_preview: HTMLDivElement;
  var picker_input: HTMLInputElement;
  var red_channel: HTMLInputElement;
  var green_channel: HTMLInputElement;
  var blue_channel: HTMLInputElement;

  var json_formatter_card: HTMLDivElement;

  var uri_encoder_card: HTMLDivElement;
  var encoder_input: NumTextElement;
  var encoder_type: HTMLInputElement;

  var uuid_generator_card: HTMLDivElement;
}

declare module "solid-js" {
  export namespace JSX {
    interface NumTextHTMLAttributes<T> extends HTMLAttributes<T> {
      placeholder?: string;
      value?: string;
    }

    interface HTMLElementTags {
      "menu-drop": HTMLAttributes<MenuDropElement>;
      "num-text": NumTextHTMLAttributes<NumTextElement>;
    }
  }
}

export {};