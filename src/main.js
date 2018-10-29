import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import Params from "./params";

window.onload = function() {
    SharedStore.commit("updateFiles");
    SharedStore.commit("updateTags");
};

Vue.prototype.SharedState = SharedState; // It is undefined inside Vue components without it
Vue.prototype.SharedStore = SharedStore;
Vue.prototype.Params = Params;

import TopBar from "./TopBar.vue";

var topBar = new Vue({
    el: "#top-bar",
    render: h => h(TopBar)
});
