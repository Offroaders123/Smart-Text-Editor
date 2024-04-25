// <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js" data-manual></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-json.min.js"></script>
// https://prismjs.com/#basic-usage
// https://prismjs.com/#basic-usage-bundlers

globalThis.Prism = { manual: true } as typeof import("prismjs");

await import("https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js");
await import("https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js");

export default globalThis.Prism;