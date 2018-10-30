import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import { Params, Const } from "./global";

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
        },
        logError: function(msg) {
            console.error(msg);
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
