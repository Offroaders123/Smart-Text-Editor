import { cardBackdropShown, setActiveDialog } from "./app.js";
import "./CardBackdrop.scss";

export default function CardBackdrop() {
  return (
    <div
      classList={{ "card-backdrop": true, active: cardBackdropShown() }}
      onclick={() => setActiveDialog(null)}
    />
  );
}