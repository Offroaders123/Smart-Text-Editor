import { activeDialog, cardBackdropShown } from "./STE.js";
import { closeCard } from "./Card.js";
import "./CardBackdrop.scss";

export default function CardBackdrop() {
  return (
    <div
      classList={{ "card-backdrop": true, active: cardBackdropShown() }}
      onclick={() => {
        if (activeDialog() === null) return;
        closeCard(activeDialog()!);
      }}
    />
  );
}