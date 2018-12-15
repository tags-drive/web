import Vue from "vue";
// Main components
import Test from "@app/index/TagsDrive.vue"
import TagsDrive from "@app/index/TagsDrive.vue";
import TopBar from "@app/index/TopBar.vue";
import FilesBlock from "@app/index/FilesBlock.vue";
import UploadBlock from "@app/index/UploadBlock.vue";
import ContextMenu from "@app/index/ContextMenu.vue";
import ModalWindow from "@app/index/ModalWindow.vue";
import LogWindow from "@app/index/LogWindow.vue";
import PreviewWindow from "@app/index/PreviewWindow.vue";

/* Tags Drive (main instance) */
new Vue({
    el: "#tags-drive",
    render: h => h(TagsDrive)
});

// /* Top Bar */
new Vue({
    el: "#top-bar",
    render: h => h(TopBar)
});

// /* Files Block */
new Vue({
    el: "#files-block",
    render: h => h(FilesBlock)
});

// /* Upload Block */
new Vue({
    el: "#upload-block",
    render: h => h(UploadBlock)
});

/* Context menu */
new Vue({
    el: "#context-menu",
    render: h => h(ContextMenu)
});

/* Modal Window */
new Vue({
    el: "#modal-window",
    render: h => h(ModalWindow)
});

/* Log Window */
new Vue({
    el: "#log-window",
    render: h => h(LogWindow)
});

/* Preview Window */
new Vue({
    el: "#preview-window",
    render: h => h(PreviewWindow)
});
