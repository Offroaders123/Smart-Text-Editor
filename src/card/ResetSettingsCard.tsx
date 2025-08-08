import Alert from "./Alert.js";
import CardItem from "./CardItem.js";
import Settings from "../img/settings.svg";

export default function ResetSettingsCard() {
  return (
    <Alert
      id="reset_settings_card"
      heading="Reset Settings"
      icon={Settings}
      main={
        <CardItem>Your settings have been reset!</CardItem>
      }
    />
  );
}