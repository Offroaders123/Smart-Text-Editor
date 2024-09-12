import Alert from "./Alert.js";
import Settings from "./img/settings.svg";

export default function ResetSettingsCard() {
  return (
    <Alert
      id="reset_settings_card"
      heading="Reset Settings"
      icon={Settings}
      main={[
        <div class="item">Your settings have been reset!</div>
      ]}
    />
  );
}