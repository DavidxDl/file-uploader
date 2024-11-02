var deleteBtns = document.querySelectorAll(".delete-btn");
var renameBtns = document.querySelectorAll(".rename-btn");
var dialog = document.querySelector("dialog");
deleteBtns === null || deleteBtns === void 0 ? void 0 : deleteBtns.forEach(function (btn) {
    if (!dialog)
        return;
    btn.addEventListener("click", function () {
        dialog.innerHTML = "";
        dialog.addEventListener("click", function (e) {
            return (!dialog.contains(e.target) || e.target === dialog) &&
                dialog.close();
        });
        var folderName = btn.dataset.folderName;
        var folderId = btn.dataset.folderId;
        var h2 = document.createElement("h2");
        h2.innerHTML = "You sure want to delete folder: <strong>".concat(folderName, "</strong>");
        var deleteBtn = document.createElement("btn");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = function (e) {
            fetch("/folders/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ folderName: folderName, folderId: folderId }),
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                console.log(data);
                dialog.close();
                location.reload();
            });
        };
        dialog.append(h2, deleteBtn);
        dialog.showModal();
    });
});
renameBtns === null || renameBtns === void 0 ? void 0 : renameBtns.forEach(function (btn) {
    if (!dialog)
        return;
    btn.addEventListener("click", function () {
        dialog.innerHTML = "";
        dialog.addEventListener("click", function (e) {
            return (!dialog.contains(e.target) || e.target === dialog) &&
                dialog.close();
        });
        var folderName = btn.dataset.folderName;
        var folderId = btn.dataset.folderId;
        var form = document.createElement("form");
        var h2 = document.createElement("h2");
        h2.innerHTML = "Rename folder";
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "new folder name";
        input.focus();
        input.required = true;
        var confirmBtn = document.createElement("button");
        confirmBtn.classList.add("confirm-btn");
        confirmBtn.innerText = "Rename";
        confirmBtn.onclick = function (e) {
            e.preventDefault();
            if (!input.value)
                return;
            fetch("/folders/rename", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    folderName: folderName,
                    folderId: folderId,
                    newFolderName: input.value,
                }),
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
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
