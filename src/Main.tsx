import ColorPickerCard from "./card/ColorPickerCard.js";
import JSONFormatterCard from "./card/JSONFormatterCard.js";
import Preview from "./workspace/Preview.js";
import ReplaceTextCard from "./card/ReplaceTextCard.js";
import Scaler from "./workspace/Scaler.js";
import URIEncoderCard from "./card/URIEncoderCard.js";
import UUIDGeneratorCard from "./card/UUIDGeneratorCard.js";
import Workspace from "./workspace/Workspace.js";
import "./Main.scss";

export function Main() {
  return (
    <main>
      <Workspace/>
      <Scaler/>
      <Preview/>
      <ReplaceTextCard/>
      <ColorPickerCard/>
      <JSONFormatterCard/>
      <URIEncoderCard/>
      <UUIDGeneratorCard/>
    </main>
  );
}