import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
// Classes and types
import { Store } from "./types";
import { File, ObjectToFile, ObjectToTag } from "@app/global/classes";
Vue.use(Vuex);

const store: StoreOptions<Store> = {
    state: {
        allFiles: [],
        allFilesChangesCounter: 0,
        //
        allTags: new Map(),
        allTagsChangesCounter: 0,
        //
        selectedFiles: [],
        selectedFilesChangesCounter: 0,
        //
        // filesReady is true after first call of updateFiles
        filesReady: false,
        // tagsReady is true after first call of updateTags
        tagsReady: false,
        // selectedFilesReady is false after calling clearSelectedFiles (it must me called before setSelectedFiles)
        // and it is true after calling setSelectedFiles
        selectedFilesReady: false
    },
    mutations: {
        // allFiles
        setFiles(state, files: object[]) {
            let updatedFiles: File[] = [];

            for (let i = 0; i < files.length; i++) {
                let f = files[i];
                let file = ObjectToFile(f);
                if (file === null) {
                    continue;
                }
                updatedFiles.push(file);
            }

            state.allFiles = updatedFiles;
            state.allFilesChangesCounter++;
        },
        setSingleFiles(state, f: any) {
            let file = ObjectToFile(f);
            if (file === null) {
                return;
            }

            for (let i = 0; i < state.allFiles.length; i++) {
                if (state.allFiles[i].id === file.id) {
                    state.allFiles[i] = file;
                    break;
                }
            }

            state.allFilesChangesCounter++;
        },
        // allTags
        setTags(state, tags: any) {
            if (tags === undefined) {
                return;
            }

            state.allTags.clear();

            for (let id in tags) {
                if (tags[id] === undefined || tags[id].name === undefined || tags[id].color === undefined) {
                    continue;
                }

                let t = ObjectToTag(tags[id]);
                if (t !== null) {
                    state.allTags.set(Number(id), t);
                }
            }

            state.tagsReady = true;
            state.allTagsChangesCounter++;
        },
        // selectedFiles
        //
        // clearSelectedFiles must be called before setSelectedFiles
        clearSelectedFiles(state) {
            state.selectedFiles = [];
            state.selectedFilesReady = false;
            state.selectedFilesChangesCounter++;
        },
        setSelectedFiles(state, files: object[]) {
            let updatedFiles: File[] = [];

            for (let i in files) {
                let f = files[i];
                // Add time was already parsed
                let file = ObjectToFile(f, true);
                if (file === null) {
                    continue;
                }
                updatedFiles.push(file);
            }

            state.selectedFiles = updatedFiles;
            state.selectedFilesReady = true;
            state.selectedFilesChangesCounter++;
        }
    }
};

export default new Vuex.Store(store);
