import { WindowControls } from "./WindowControls.tsx";

export function Card() {
  return (
    <div>
      <WindowControls
        onClose={() => { }}
        onMinimize={() => { }}
        onMaximize={() => { }}
      />
    </div>
  );
}
