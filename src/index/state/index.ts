import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { State } from "./types";

Vue.use(Vuex);

const settingsKey = "settings";

const state: StoreOptions<State> = {
    state: {
        showDropLayer: true, // when we show modal-window with tags showDropLayer is false
        selectMode: false,
        showModalWindow: false,
        // settings
        settings: {
            showDeletedFiles: false,
            scrollOffset: 5
        }
    },
    mutations: {
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
        showModalWindow(state) {
            state.showModalWindow = true;
        },
        hideModalWindow(state) {
            state.showModalWindow = false;
        },
        // settings
        readSettings(state) {
            if (localStorage.getItem(settingsKey) === null) {
                // Write default settings
                localStorage.setItem(settingsKey, JSON.stringify(state.settings));
                return;
            }

            let settings = JSON.parse(localStorage.getItem(settingsKey)!);
            // Cope defined settings into state
            Object.assign(state.settings, settings);
        },
        applySettings(state, payload) {
            Object.assign(state.settings, payload);
        },
        saveSettings(state) {
            localStorage.setItem(settingsKey, JSON.stringify(state.settings));
        },
        resetSettings(state) {
            // clear all local storage
            localStorage.clear();
        }
    }
};

export default new Vuex.Store(state);
