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
        // setters
        setAuthorized(state, payload) {
            if (!checkValue(payload, "boolean")) {
                return;
            }

            state.user.authorized = payload.value as boolean;
        },
        setShareToken(state, payload) {
            if (!checkValue(payload, "string")) {
                return;
            }

            state.shareToken = payload.value as string;
        },
        setShareMode(state, payload) {
            if (!checkValue(payload, "boolean")) {
                return;
            }

            state.shareMode = payload.value as boolean;
        },
        setShowDropLayer(state, payload) {
            if (!checkValue(payload, "boolean")) {
                return;
            }

            state.showDropLayer = payload.value as boolean;
        },
        setSelectMode(state, payload) {
            if (!checkValue(payload, "boolean")) {
                return;
            }

            state.selectMode = payload.value as boolean;
        },
        setShowModalWindow(state, payload) {
            if (!checkValue(payload, "boolean")) {
                return;
            }

            state.showModalWindow = payload.value as boolean;
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

export function setShareToken(v: string) {
    Store.commit("setShareToken", { value: v });
}

export function setShareMode(v: boolean) {
    Store.commit("setShareMode", { value: v });
}

export function setShowDropLayer(v: boolean) {
    Store.commit("setShowDropLayer", { value: v });
}

export function setSelectMode(v: boolean) {
    Store.commit("setSelectMode", { value: v });
}

export function setShowModalWindow(v: boolean) {
    Store.commit("setShowModalWindow", { value: v });
}

export function readSettings() {
    Store.commit("readSettings");
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
