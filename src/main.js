import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import { Params, Const } from "./global";

Vue.prototype.SharedState = SharedState; // It is undefined inside Vue components without it
Vue.prototype.SharedStore = SharedStore;
Vue.prototype.Params = Params;
Vue.prototype.Const = Const;

window.onload = function() {
    SharedStore.commit("updateFiles");
    SharedStore.commit("updateTags");
};

import TopBar from "./TopBar.vue";

var topBar = new Vue({
    el: "#top-bar",
    render: h => h(TopBar)
});
