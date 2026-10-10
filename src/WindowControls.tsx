export function WindowControls(props: {
  onClose: () => void,
  onMinimize: () => void,
  onMaximize: () => void,
}) {
  return (
    <div class="window-controls">
      <WindowControl
        control="close"
        onClick={props.onClose}
      />
      <WindowControl
        control="minimize"
        onClick={props.onMinimize}
      />
      <WindowControl
        control="maximize"
        onClick={props.onMaximize}
      />
    </div>
  );
}

const Control = {
  close: "✕",
  minimize: "—",
  maximize: "⤡"
} as const;

type Control = keyof typeof Control;

function WindowControl(props: {
  control: Control,
  onClick: () => void,
}) {
  return (
    <button
      class="control"
      data-control={props.control}
      on:click={props.onClick}
      tabindex={-1}>
      {Control[props.control]}
    </button>
  );
}
