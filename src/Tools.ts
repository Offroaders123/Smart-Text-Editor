import { Editor } from "./Editor.js";
import { setView } from "./Workspace.js";

export type TemplateType = "html" | "pack-manifest-bedrock";

/**
 * A global object with static properties to work with the various tools provided the app.
*/
export class Tools {
  /**
   * A namespace with functions for the Replace Text widget.
  */
  static replaceText = {
    replace() {
      var { container: editor } = STE.query();
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

  /**
   * A namespace with functions for the JSON Formatter widget.
  */
  static jsonFormatter = {
    format(spacing: string = "  ") {
      try {
        var formatted = JSON.stringify(JSON.parse(formatter_input.value),null,spacing);
        if (formatted != formatter_input.value) formatter_input.value = formatted;
      } catch (error: any){
        /* ~~Make~~ Made matching for "position" optional, as Safari doesn't give JSON parsing error data, it only says that an error occurred. */
        try {
          var message = error.toString().match(/^(.+?)position /)[0],
            errorIndex = error.toString().match(/position (\d+)/)[1],

            errorLine,
            errorLineIndex = (() => {
              var lineIndexes = indexi("\n",formatter_input.value);
              errorLine = formatter_input.value.substring(0,errorIndex).split("\n").length - 1;
              return lineIndexes[errorLine - 1] || 1;
            })(),
            errorPosition = errorIndex - errorLineIndex + 1;

          alert(`Could not parse JSON, a syntax error occurred.\n${message}line ${errorLine + 1} position ${errorPosition}`);
        } catch {
          alert("Could not parse JSON, a syntax error occurred.");
        }
      }


    function indexi(char: string, str: string){
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

  /**
   * A namespace with functions for the URI Encoder widget.
  */
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

  /**
   * A namespace with functions for the UUID Generator widget.
  */
  static uuidGenerator = (() => {
    var lut: string[] = [];
    for (var i = 0; i < 256; i++) lut[i] = ((i < 16) ? "0" : "") + i.toString(16);
    return {
      generate: () => {
        var d0 = (Math.random() * 0xffffffff) | 0, d1 = (Math.random() * 0xffffffff) | 0, d2 = (Math.random() * 0xffffffff) | 0, d3 = (Math.random() * 0xffffffff) | 0;
        return `${lut[d0 & 0xff]}${lut[(d0 >> 8) & 0xff]}${lut[(d0 >> 16) & 0xff]}${lut[(d0 >> 24) & 0xff]}-${lut[d1 & 0xff]}${lut[(d1 >> 8) & 0xff]}-${lut[((d1 >> 16) & 0x0f) | 0x40]}${lut[(d1 >> 24) & 0xff]}-${lut[(d2 & 0x3f) | 0x80]}${lut[(d2 >> 8) & 0xff]}-${lut[(d2 >> 16) & 0xff]}${lut[(d2 >> 24) & 0xff]}${lut[d3 & 0xff]}${lut[(d3 >> 8) & 0xff]}${lut[(d3 >> 16) & 0xff]}${lut[(d3 >> 24) & 0xff]}`;
      }
    };
  })()

  /**
   * Creates a new Editor from a given template type.
  */
  static insertTemplate(type: TemplateType) {
    let value: string | undefined;
    let name: string | undefined;

    switch (type){
      case "html": {
        let language = navigator.language;
        if (language.includes("-")){
          language = language.replace(/[^-]+$/g,code => code.toUpperCase());
        }
        name = "index.html";
        value = decodeURI(`%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22${language}%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E`);
        break;
      }
      case "pack-manifest-bedrock": {
        name = "manifest.json";
        value = decodeURI(`%7B%0A%20%20%22format_version%22:%202,%0A%0A%20%20%22header%22:%20%7B%0A%20%20%20%20%22name%22:%20%22Pack%20Manifest%20Template%20-%20Bedrock%20Edition%22,%0A%20%20%20%20%22description%22:%20%22Your%20resource%20pack%20description%22,%0A%20%20%20%20%22uuid%22:%20%22${Tools.uuidGenerator.generate()}%22,%0A%20%20%20%20%22version%22:%20%5B%201,%200,%200%20%5D,%0A%20%20%20%20%22min_engine_version%22:%20%5B%201,%2013,%200%20%5D%0A%20%20%7D,%0A%20%20%22modules%22:%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22description%22:%20%22Your%20resource%20pack%20description%22,%0A%20%20%20%20%20%20%22type%22:%20%22resources%22,%0A%20%20%20%20%20%20%22uuid%22:%20%22${Tools.uuidGenerator.generate()}%22,%0A%20%20%20%20%20%20%22version%22:%20%5B%201,%200,%200%20%5D%0A%20%20%20%20%7D%0A%20%20%5D,%0A%20%20%22metadata%22:%20%7B%0A%20%20%20%20%22authors%22:%20%5B%0A%20%20%20%20%20%20%22Add%20author%20names%20here%20(optional,%20'metadata'%20can%20be%20removed%20altogether)%22%0A%20%20%20%20%5D%0A%20%20%7D%0A%7D`);
        break;
      }
      default: throw new TypeError(`${type} is not a supported template type`);
    }

    if (value === undefined) return;

    new Editor({ name, value });
    if (STE.view === "preview"){
      setView("split");
    }
  }
}

declare global {
  var Tools: Tools;
}

globalThis.Tools = Tools;

export default Tools;