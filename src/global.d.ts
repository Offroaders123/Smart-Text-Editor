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

  var scrollbar_styles: HTMLStyleElement;

  // var header: HTMLElement;

  // var app_menubar: HTMLDivElement;
  var file_menu: MenuDropElement; // styles only
  // var view_menu: MenuDropElement;
  // var preview_menu: MenuDropElement;
  // var tools_menu: MenuDropElement;

  // var app_omnibox: HTMLDivElement;
  var install_option: HTMLButtonElement;

  // var main: HTMLElement;

  // var workspace: HTMLDivElement;
  // var workspace_tabs: HTMLDivElement;
  // var create_editor_button: HTMLButtonElement;
  // var workspace_editors: HTMLDivElement;
  // var scaler: HTMLDivElement;
  // var preview: HTMLIFrameElement;

  // var replace_text_card: HTMLDivElement; // getElementById only

  // var color_picker_card: HTMLDivElement; // getElementById only
  var picker_preview: HTMLDivElement;
  var picker_input: HTMLInputElement;
  var red_channel: HTMLInputElement;
  var green_channel: HTMLInputElement;
  var blue_channel: HTMLInputElement;

  // var json_formatter_card: HTMLDivElement; // getElementById only

  // var uri_encoder_card: HTMLDivElement; // getElementById only
  // var encoder_input: NumTextElement;
  var encoder_type: HTMLInputElement;

  // var uuid_generator_card: HTMLDivElement; // getElementById only
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