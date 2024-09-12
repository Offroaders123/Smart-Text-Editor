import type { ParentProps } from "solid-js";

export interface CardItemProps extends ParentProps {
  list?: boolean;
  start?: boolean;
  expand?: boolean;
}

export default function CardItem(props: CardItemProps) {
  return (
    <div
      classList={{
        item: true,
        list: props.list,
        start: props.start,
        expand: props.expand
      }}>
      {props.children}
    </div>
  );
}