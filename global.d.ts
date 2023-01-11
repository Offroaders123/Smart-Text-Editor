declare global {
  interface Window {
    Prism: typeof import("prismjs");
  }

  interface Navigator {
    readonly standalone: boolean;
  }

  interface Screen {
    readonly availLeft: number;
    readonly availTop: number;
  }

  var theme_color: HTMLMetaElement;
  var scrollbar_styles: HTMLStyleElement;
  var theme_styles: HTMLStyleElement;
  var symbol_definitions: SVGSVGElement;
  var arrow_icon: SVGSymbolElement;
  var check_icon: SVGSymbolElement;
  var back_icon: SVGSymbolElement;
  var minimize_icon: SVGSymbolElement;
  var close_icon: SVGSymbolElement;
  var rename_icon: SVGSymbolElement;
  var undo_icon: SVGSymbolElement;
  var redo_icon: SVGSymbolElement;
  var install_icon: SVGSymbolElement;
  var refresh_icon: SVGSymbolElement;
  var github_icon: SVGSymbolElement;
  var header: HTMLElement;
  var file_menu: MenuDropElement;
  var view_menu: MenuDropElement;
  var preview_menu: MenuDropElement;
  var tools_menu: MenuDropElement;
  var settings_menu: MenuDropElement;
  var install_option: HTMLButtonElement;
  var main: HTMLElement;
  var workspace: HTMLDivElement;
  var workspace_tabs: HTMLDivElement;
  var create_editor_button: HTMLButtonElement;
  var workspace_editors: HTMLDivElement;
  var scaler: HTMLDivElement;
  var preview: HTMLIFrameElement;
  var card_backdrop: HTMLDivElement;
  var settings_card: STECardElement;
  var default_orientation_setting: MenuDropElement;
  var syntax_highlighting_setting: HTMLInputElement;
  var automatic_refresh_setting: input;
  var install_button: HTMLButtonElement;
  var theme_button: HTMLButtonElement;
  var clear_site_caches_button: HTMLButtonElement;
  var theme_card: STECardElement;
  var theme_setting: NumTextElement;
  var preview_base_card: STECardElement;
  var preview_base_input: HTMLInputElement & {
    setWidth(): void;
    setValue(value: string): void;
    reset(): void;
  };
  var reset_settings_card: STECardElement;
  var cleared_cache_card: STECardElement;
  var replace_text_card: STECardElement;
  var replacer_find: NumTextElement;
  var replacer_replace: NumTextElement;
  var color_picker_card: STECardElement;
  var picker_preview: HTMLDivElement;
  var picker_input: HTMLInputElement;
  var red_channel: HTMLInputElement;
  var green_channel: HTMLInputElement;
  var blue_channel: HTMLInputElement;
  var json_formatter_card: STECardElement;
  var formatter_input: NumTextElement;
  var uri_encoder_card: STECardElement;
  var encoder_input: NumTextElement;
  var encoder_type: HTMLInputElement;
  var uuid_generator_card: STECardElement;
  var generator_output: HTMLInputElement;
}

export {};