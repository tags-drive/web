import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        mainBlockOpacity: 1,
        showDropLayer: true, // when we show modal-window with tags showDropLayer is false
        selectMode: false
    },
    mutations: {
        increaseMainBlockOpacity(state) {
            state.mainBlockOpacity = 1;
        },
        reduceMainBlockOpacity(state) {
            state.mainBlockOpacity = 0.3;
        },
        showDropLayer(state) {
            state.showDropLayer = true;
        },
        hideDropLayer(state) {
            state.showDropLayer = false;
        },
        setSelectMode(state) {
            state.selectMode = true;
        },
        unsetSelectMode(state) {
            state.selectMode = false;
        }
    }
});
