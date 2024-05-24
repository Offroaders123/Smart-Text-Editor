/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app.js";
import "./index.scss";

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => <App/>, root);