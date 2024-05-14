import { activeDialog, cardBackdropShown } from "./STE.js";

export default function CardBackdrop() {
  return (
    <div
      classList={{ "card-backdrop": true, active: cardBackdropShown() }}
      onclick={() => {
        if (activeDialog() === null) return;
        activeDialog()!.close();
      }}
    />
  );
}