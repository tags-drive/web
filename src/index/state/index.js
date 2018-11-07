import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        filesBlockOpacity: 1,
        showDropLayer: true, // when we show modal-window with tags showDropLayer is false
        selectMode: false
    },
    mutations: {
        increaseFilesBlockOpacity(state) {
            state.filesBlockOpacity = 1;
        },
        reduceFilesBlockOpacity(state) {
            state.filesBlockOpacity = 0.3;
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
