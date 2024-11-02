const buttons = document.querySelectorAll<HTMLButtonElement>(".delete-btn");
const dialog = document.querySelector<HTMLDialogElement>("dialog");

buttons?.forEach((btn) => {
  if (!dialog) return;

  btn.addEventListener("click", () => {
    dialog.innerHTML = "";
    dialog.addEventListener(
      "click",
      (e) =>
        (!dialog.contains(e.target as Node) || e.target === dialog) &&
        dialog.close(),
    );

    const folderName = btn.dataset.folderName;
    const fileName = btn.dataset.fileName;
    const fileId = btn.dataset.fileId;

    console.log(folderName, fileName, fileId);

    const h2 = document.createElement("h2");
    h2.innerHTML = `You sure want to delete file?`;

    const deleteBtn = document.createElement("btn");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerText = "Delete";

    deleteBtn.onclick = () => {
      fetch("/files/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderName, fileName, fileId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          dialog.close();
          location.reload();
        });
    };

    dialog.append(h2, deleteBtn);
    dialog.showModal();
  });
});
