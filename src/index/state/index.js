import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const settingsKey = "settings";

export default new Vuex.Store({
    state: {
        filesBlockOpacity: 1,
        showDropLayer: true, // when we show modal-window with tags showDropLayer is false
        selectMode: false,
        // settings
        settings: {
            showDeletedFiles: false
        }
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
        },
        // settings
        readSettings(state) {
            if (localStorage.getItem(settingsKey) === null) {
                // Write default settings
                localStorage.setItem(settingsKey, JSON.stringify(state.settings));
                return;
            }

            let settings = JSON.parse(localStorage.getItem(settingsKey));
            // Cope defined settings into state
            Object.assign(state.settings, settings);
        },
        saveSettings(state) {
            localStorage.setItem(settingsKey, JSON.stringify(state.settings));
        },
        changeSettings(state, payload) {
            Object.assign(state.settings, payload);
        }
    }
});
