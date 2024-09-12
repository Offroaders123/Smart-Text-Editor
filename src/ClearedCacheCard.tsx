import Alert from "./Alert.js";
import Template from "./img/template.svg";

export default function ClearedCacheCard() {
  return (
    <Alert
      id="cleared_cache_card"
      headingText="Cleared Cache"
      headingIcon={Template}
      mainContent={[
        <div class="item">Successfully cleared offline cache!</div>
      ]}
    />
  );
}