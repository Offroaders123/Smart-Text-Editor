export function Preview(props: {
  getSrc: () => string,
}) {
  return (
    <iframe
      sandbox="allow-scripts"
      srcdoc={props.getSrc()}
    />
  );
}
