import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";

window.onload = function() {
	SharedState.commit("readSettings");
    SharedStore.commit("updateFiles");
    SharedStore.commit("updateTags");
};

import TagsDrive from "./TagsDrive.vue";
// TODO
/*
import TopBar from "./TopBar.vue";
import FilesBlock from "./FilesBlock.vue";
import UploadBlock from "./UploadBlock.vue";
import ContextMenu from "./ContextMenu.vue";
import ModalWindow from "./ModalWindow.vue";
import LogWindow from "./LogWindow.vue";
import PreviewWindow from "./PreviewWindow.vue";
*/

/* Tags Drive (main instance) */
new Vue({
    el: "#tags-drive",
    render: h => h(TagsDrive)
});

// TODO
// /* Top Bar */
// new Vue({
//     el: "#top-bar",
//     render: h => h(TopBar)
// });

// /* Files Block */
// new Vue({
//     el: "#files-block",
//     render: h => h(FilesBlock)
// });

// /* Upload Block */
// new Vue({
//     el: "#upload-block",
//     render: h => h(UploadBlock)
// });

// /* Context menu */
// new Vue({
//     el: "#context-menu",
//     render: h => h(ContextMenu)
// });

// /* Modal Window */
// new Vue({
//     el: "#modal-window",
//     render: h => h(ModalWindow)
// });

// /* Log Window */
// new Vue({
//     el: "#log-window",
//     render: h => h(LogWindow)
// });

// /* Preview Window */
// new Vue({
//     el: "#preview-window",
//     render: h => h(PreviewWindow)
// });