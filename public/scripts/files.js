var buttons = document.querySelectorAll(".delete-btn");
var dialog = document.querySelector("dialog");
buttons === null || buttons === void 0 ? void 0 : buttons.forEach(function (btn) {
    if (!dialog)
        return;
    btn.addEventListener("click", function () {
        dialog.innerHTML = "";
        dialog.addEventListener("click", function (e) {
            return (!dialog.contains(e.target) || e.target === dialog) &&
                dialog.close();
        });
        var folderName = btn.dataset.folderName;
        var fileName = btn.dataset.fileName;
        var fileId = btn.dataset.fileId;
        console.log(folderName, fileName, fileId);
        var h2 = document.createElement("h2");
        h2.innerHTML = "You sure want to delete file?";
        var deleteBtn = document.createElement("btn");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = function () {
            fetch("/files/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ folderName: folderName, fileName: fileName, fileId: fileId }),
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
