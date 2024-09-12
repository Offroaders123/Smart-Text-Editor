import Dialog from "./Dialog.js";

export default function ThemeCard() {
  return (
    <Dialog
      id="theme_card"
      cardParent="settings_card"
      headingText="Theme"
      mainContent={[
        <div class="item list">
          <span style="line-height: 1.6;">Custom workspace theme settings<br/>will be featured in a later update.</span>
        </div>,
        // <div class="item list expand">
        //   <num-text
        //     ref={ref => applyEditingBehavior(ref)}
        //     id="theme_setting"
        //     placeholder="CSS to modify..."
        //   />
        // </div>
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