const questionBtn = document.getElementById("questionBtn");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const helpBox = document.getElementById("helpBox");

questionBtn.addEventListener("click", handleHelpBoxOpen);
questionBtn.addEventListener("touchstart", handleHelpBoxOpen);
function handleHelpBoxOpen(e) {
  if (helpBox.classList.contains("show")) {
    return handleHelpBoxClose(e);
  }

  e.preventDefault();
  e.stopPropagation();
  helpBox.classList.add("show");
}

closeHelpBtn.addEventListener("click", handleHelpBoxClose);
closeHelpBtn.addEventListener("touchstart", handleHelpBoxClose);
function handleHelpBoxClose(e) {
  e.preventDefault();
  e.stopPropagation();
  helpBox.classList.remove("show");
}
