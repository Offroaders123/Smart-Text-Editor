export function MenuItem(props: {
  accelerator: string,
  children: string,
}) {
  return (
    <li accelerator={props.accelerator}>{props.children}</li>
  );
}
