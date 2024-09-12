import Dialog from "./Dialog.js";
import CardItem from "./CardItem.js";

export default function ThemeCard() {
  return (
    <Dialog
      id="theme_card"
      parent="settings_card"
      heading="Theme"
      main={[
        <CardItem list>
          <span style="line-height: 1.6;">Custom workspace theme settings<br/>will be featured in a later update.</span>
        </CardItem>,
        // <CardItem list expand>
        //   <num-text
        //     ref={ref => applyEditingBehavior(ref)}
        //     id="theme_setting"
        //     placeholder="CSS to modify..."
        //   />
        // </CardItem>
      ]}
      // options={[
      //   <button
      //     onclick={() => resetTheme()}>
      //     Reset Theme
      //   </button>
      // ]}
    />
  );
}