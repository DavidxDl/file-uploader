const deleteBtns = document.querySelectorAll<HTMLButtonElement>(".delete-btn");
const renameBtns = document.querySelectorAll<HTMLButtonElement>(".rename-btn");
const dialog = document.querySelector<HTMLDialogElement>("dialog");

deleteBtns?.forEach((btn) => {
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
    const folderId = btn.dataset.folderId;

    const h2 = document.createElement("h2");
    h2.innerHTML = `You sure want to delete folder: <strong>${folderName}</strong>`;

    const deleteBtn = document.createElement("btn");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerText = "Delete";

    deleteBtn.onclick = (e) => {
      fetch("/folders/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderName: folderName, folderId: folderId }),
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

renameBtns?.forEach((btn) => {
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
    const folderId = btn.dataset.folderId;

    const form = document.createElement("form");

    const h2 = document.createElement("h2");
    h2.innerHTML = `Rename folder`;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "new folder name";
    input.focus();
    input.required = true;

    const confirmBtn = document.createElement("button");
    confirmBtn.classList.add("confirm-btn");
    confirmBtn.innerText = "Rename";

    confirmBtn.onclick = (e) => {
      e.preventDefault();
      if (!input.value) return;
      fetch("/folders/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName,
          folderId,
          newFolderName: input.value,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          dialog.close();
          location.reload();
        });
    };

    form.append(h2, input, confirmBtn);
    dialog.append(form);
    dialog.showModal();
  });
});
