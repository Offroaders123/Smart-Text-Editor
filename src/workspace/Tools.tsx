import { setEditorValue, view } from "../app.js";
import { setView } from "./Workspace.js";

export type TemplateType = "html";

/**
 * Creates a new Editor from a given template type.
*/
export function insertTemplate(type: TemplateType): void {
  let value: string | undefined;
  // let name: string | undefined;

  switch (type){
    case "html": {
      let { language } = navigator;
      if (language.includes("-")){
        language = language.replace(/[^-]+$/g,code => code.toUpperCase());
      }
      // name = "index.html";
      value = decodeURI(`%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22${language}%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E`);
      break;
    }
    default: throw new TypeError(`${type} is not a supported template type`);
  }

  if (value === undefined) return;

  setEditorValue(value);
  if (view() === "preview"){
    setView("split");
  }
}