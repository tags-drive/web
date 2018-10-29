import Vue from "vue";
// Shared data
import SharedStore from "./store";
import SharedState from "./state";
import Params from "./params";

Vue.prototype.SharedState = SharedState; // It is undefined inside Vue components without it
Vue.prototype.SharedStore = SharedStore;
Vue.prototype.Params = Params;
