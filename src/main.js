import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import { Params, Const } from "./global";
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
            console.info(msg);
            EventBus.$emit(Events.LogEvent, { type: Const.logType.info, msg: msg });
        },
        logError: function(msg) {
            console.error(msg);
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

var topBar = new Vue({
    el: "#top-bar",
    render: h => h(TopBar)
});

var filesBlock = new Vue({
    el: "#files-block",
    render: h => h(FilesBlock)
});

var uploadBlock = new Vue({
    el: "#upload-block",
    render: h => h(UploadBlock)
});

var contextMenu = new Vue({
    el: "#context-menu",
    render: h => h(ContextMenu)
});

var modalWindow = new Vue({
    el: "#modal-window",
    render: h => h(ModalWindow)
});

var logWindow = new Vue({
    el: "#log-window",
    render: h => h(LogWindow)
});
