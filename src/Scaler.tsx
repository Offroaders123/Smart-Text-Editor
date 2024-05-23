import type { Setter } from "solid-js";

export interface ScalerProps {
  setScaler: Setter<HTMLDivElement | null>;
}

export default function Scaler(props: ScalerProps) {
  return (
    <div
      ref={props.setScaler}
      class="scaler"
    />
  );
}