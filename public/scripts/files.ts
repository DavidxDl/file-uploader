const dialog = document.querySelector<HTMLDialogElement>(".options");
const optionsBtn = document.querySelector<HTMLDialogElement>(".showOptions");

optionsBtn.onclick = (e) => {
  dialog.showPopover();
};
