import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { State, ViewModes } from "./types";

Vue.use(Vuex);

const settingsKey = "settings";

const state: StoreOptions<State> = {
    state: {
        user: {
            authorized: false
        },
        shareMode: false,
        shareToken: "",
        // settings
        settings: {
            showDeletedFiles: false,
            viewMode: ViewModes.cards.value
        },
        //
        showDropLayer: true, // when we show modal-window with tags showDropLayer is false
        selectMode: false,
        showModalWindow: false
    },
    mutations: {
        setAuthorized(state, payload) {
            if (!checkValue(payload, "boolean")) {
                return;
            }

            state.user.authorized = payload.value as boolean;
        },
        enableShareMode(state) {
            state.shareMode = true;
        },
        setShareToken(state, payload) {
            if (payload.token === undefined) {
                return;
            }
            state.shareToken = <string>payload.token;
        },
        //
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

const Store = new Vuex.Store(state);

export default Store;

export function setAuthorized(v: boolean) {
    Store.commit("setAuthorized", { value: v });
}

// checkValue checks v.value
function checkValue(v: any, type: string): boolean {
    if (v === undefined || v.value === undefined) {
        return false;
    }

    if (typeof v.value !== type) {
        return false;
    }

    return true;
}
