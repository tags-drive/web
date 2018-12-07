import Vue from "vue";

import TagsDrive from "./TagsDrive.vue";
import TopBar from "./TopBar.vue";
import FilesBlock from "./FilesBlock.vue";
import UploadBlock from "./UploadBlock.vue";
import ContextMenu from "./ContextMenu.vue";
// TODO
/*
import ModalWindow from "./ModalWindow.vue";
*/
import LogWindow from "./LogWindow.vue";
import PreviewWindow from "./PreviewWindow.vue";


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

// TODO
// /* Modal Window */
// new Vue({
//     el: "#modal-window",
//     render: h => h(ModalWindow)
// });

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
