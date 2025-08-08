import Alert from "./Alert.js";
import CardItem from "./CardItem.js";
import Template from "../img/template.svg";

export default function ClearedCacheCard() {
  return (
    <Alert
      id="cleared_cache_card"
      heading="Cleared Cache"
      icon={Template}
      main={
        <CardItem>Successfully cleared offline cache!</CardItem>
      }
    />
  );
}