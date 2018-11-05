import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import { Params, Const } from "../global";
import { Events, EventBus } from "./eventBus";

Vue.prototype.SharedState = SharedState; // It is undefined inside Vue components without it
Vue.prototype.SharedStore = SharedStore;
Vue.prototype.Params = Params;
Vue.prototype.Const = Const;

Vue.mixin({
    methods: {
        isErrorStatusCode: function(statusCode) {
            if (400 <= statusCode && statusCode < 600) {
                return true;
            }
            return false;
        },
        logInfo: function(msg) {
            /* eslint-disable no-console */
            console.info(msg);
            /* eslint-enable no-console */
            EventBus.$emit(Events.LogEvent, { type: Const.logType.info, msg: msg });
        },
        logError: function(msg) {
            /* eslint-disable no-console */
            console.error(msg);
            /* eslint-enable no-console */
            EventBus.$emit(Events.LogEvent, { type: Const.logType.error, msg: msg });
        }
    }
});

window.onload = function() {
    SharedStore.commit("updateFiles");
    SharedStore.commit("updateTags");
};

import TopBar from "./TopBar.vue";
import FilesBlock from "./FilesBlock.vue";
import UploadBlock from "./UploadBlock.vue";
import ContextMenu from "./ContextMenu.vue";
import ModalWindow from "./ModalWindow.vue";
import LogWindow from "./LogWindow.vue";
import PreviewWindow from "./PreviewWindow.vue";

/* Top Bar */
new Vue({
    el: "#top-bar",
    render: h => h(TopBar)
});

/* Files Block */
new Vue({
    el: "#files-block",
    render: h => h(FilesBlock)
});

/* Upload Block */
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
