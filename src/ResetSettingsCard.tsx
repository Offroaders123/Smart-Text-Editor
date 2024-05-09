import { Alert } from "./Card.js";
import Settings from "./img/settings.svg";

export default function ResetSettingsCard() {
  return (
    <Alert
      id="reset_settings_card"
      headingText="Reset Settings"
      headingIcon={Settings}
      mainContent={[
        <div class="item">Your settings have been reset!</div>
      ]}
    />
  );
}