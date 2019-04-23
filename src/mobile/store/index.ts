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
        allFilesFetched: false,
        //
        allTags: new Map(),
        allTagsChangesCounter: 0
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
        addFiles(state, files: object[]) {
            let updatedFiles: File[] = state.allFiles;

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
        setAllFilesFetched(state) {
            state.allFilesFetched = true;
        },
        unsetAllFilesFetched(state) {
            state.allFilesFetched = false;
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

            state.allTagsChangesCounter++;
        }
    }
};

export default new Vuex.Store(store);
