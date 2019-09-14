import Vue from "vue";
// Main components
import TagsDrive from "@app/index/TagsDrive.vue";
import TopBar from "@app/index/TopBar.vue";
import Files from "@app/index/Files.vue";
import UploadWindow from "@app/index/UploadWindow.vue";
import ContextMenu from "@app/index/ContextMenu.vue";
import ModalWindow from "@app/index/ModalWindow.vue";
import LogWindow from "@app/index/LogWindow.vue";
import PreviewWindow from "@app/index/PreviewWindow.vue";
//
import ShareState, { setAuthorized, setShareMode } from "@app/index/state";
import API from "@app/index/api";

// Define if user is authorized
API.isUserAuthorized().then(authorized => {
    if (authorized) {
        setAuthorized(true);
    }
});

// Detect share mode
let res = /shareToken=([\w\d]+)/g.exec(location.search);
if (res !== null && res[1] !== undefined) {
    setShareMode(true);
    ShareState.commit("setShareToken", { token: res[1] });
}

// Tags Drive (main instance)
new Vue({
    el: "#tags-drive",
    render: h => h(TagsDrive)
});

// Top Bar
new Vue({
    el: "#top-bar",
    render: h => h(TopBar)
});

// Files
new Vue({
    el: "#all-files",
    render: h => h(Files)
});

// Upload Block
new Vue({
    el: "#upload-window",
    render: h => h(UploadWindow)
});

// Context menu
new Vue({
    el: "#context-menu",
    render: h => h(ContextMenu)
});

// Modal Window
new Vue({
    el: "#modal-window",
    render: h => h(ModalWindow)
});

// Log Window
new Vue({
    el: "#log-window",
    render: h => h(LogWindow)
});

// Preview Window
new Vue({
    el: "#preview-window",
    render: h => h(PreviewWindow)
});
