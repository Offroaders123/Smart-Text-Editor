import { view } from "./STE.js";
import Editor from "./Editor.js";
import { setView } from "./Workspace.js";
import { generate } from "./UUIDGeneratorCard.js";

export type TemplateType = "html" | "pack-manifest-bedrock";

/**
 * Creates a new Editor from a given template type.
*/
export function insertTemplate(type: TemplateType): void {
  let value: string | undefined;
  let name: string | undefined;

  switch (type){
    case "html": {
      let { language } = navigator;
      if (language.includes("-")){
        language = language.replace(/[^-]+$/g,code => code.toUpperCase());
      }
      name = "index.html";
      value = decodeURI(`%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22${language}%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E`);
      break;
    }
    case "pack-manifest-bedrock": {
      name = "manifest.json";
      value = decodeURI(`%7B%0A%20%20%22format_version%22:%202,%0A%0A%20%20%22header%22:%20%7B%0A%20%20%20%20%22name%22:%20%22Pack%20Manifest%20Template%20-%20Bedrock%20Edition%22,%0A%20%20%20%20%22description%22:%20%22Your%20resource%20pack%20description%22,%0A%20%20%20%20%22uuid%22:%20%22${generate()}%22,%0A%20%20%20%20%22version%22:%20%5B%201,%200,%200%20%5D,%0A%20%20%20%20%22min_engine_version%22:%20%5B%201,%2013,%200%20%5D%0A%20%20%7D,%0A%20%20%22modules%22:%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22description%22:%20%22Your%20resource%20pack%20description%22,%0A%20%20%20%20%20%20%22type%22:%20%22resources%22,%0A%20%20%20%20%20%20%22uuid%22:%20%22${generate()}%22,%0A%20%20%20%20%20%20%22version%22:%20%5B%201,%200,%200%20%5D%0A%20%20%20%20%7D%0A%20%20%5D,%0A%20%20%22metadata%22:%20%7B%0A%20%20%20%20%22authors%22:%20%5B%0A%20%20%20%20%20%20%22Add%20author%20names%20here%20(optional,%20'metadata'%20can%20be%20removed%20altogether)%22%0A%20%20%20%20%5D%0A%20%20%7D%0A%7D`);
      break;
    }
    default: throw new TypeError(`${type} is not a supported template type`);
  }

  if (value === undefined) return;

  new Editor({ name, value });
  if (view() === "preview"){
    setView("split");
  }
}