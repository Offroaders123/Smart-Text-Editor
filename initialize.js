var windowParent, removeTransitions = "--transition-slow: 0s; --transition-medium: 0s; --transition-fast: 0s";
if (window == window.parent){
  windowParent = true;
} else {
  windowParent = false;
  console.clear();
}
if (windowParent){
  document.documentElement.style = removeTransitions;
  document.documentElement.classList.add("fade");
}