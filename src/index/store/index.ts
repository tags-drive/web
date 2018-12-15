import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
// Classes and types
import { Store } from "./types";
import { File, Tag } from "@app/index/global";
// Other
import dateformat from "dateformat";
import { Params } from "@app/global";
import { logError } from "@app/index/tools";

Vue.use(Vuex);

function objectToFile(f: any, skipTimeParsing?: boolean): File | null {
    if (
        f === undefined ||
        f.type === undefined ||
        f.filename === undefined ||
        f.origin === undefined ||
        f.description === undefined ||
        f.size === undefined ||
        f.tags === undefined ||
        f.addTime === undefined ||
        // Preview can be omitted
        f.deleted === undefined ||
        f.timeToDelete === undefined
    ) {
        return null;
    }

    let file: File = new File();
    file.type = <string>f.type;
    file.filename = <string>f.filename;
    file.origin = <string>f.origin;
    file.description = <string>f.description;
    file.size = <number>f.size;
    file.tags = <number[]>f.tags;

    if (!skipTimeParsing) {
        file.addTime = dateformat(new Date(f.addTime), "dd-mm-yyyy HH:MM");
    } else {
        file.addTime = f.addTime || "";
    }

    file.preview = f.preview ? <string>f.preview : "";
    file.deleted = <boolean>f.deleted;
    file.timeToDelete = <number>f.timeToDelete;

    return file;
}

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
        updateFiles(state) {
            fetch(Params.Host + "/api/files", {
                method: "GET",
                credentials: "same-origin"
            })
                .then(data => data.json())
                .then(files => {
                    let updatedFiles: File[] = [];

                    for (let i in files) {
                        let f = files[i];

                        let file = objectToFile(f);
                        if (file === null) {
                            continue;
                        }
                        updatedFiles.push(file);
                    }

                    state.filesReady = true;
                    state.allFiles = updatedFiles;
                    state.allFilesChangesCounter++;
                })
                .catch(err => logError(err));
        },
        setFiles(state, files: object[]) {
            let updatedFiles: File[] = [];

            for (let i in files) {
                let f = files[i];
                let file = objectToFile(f);
                if (file === null) {
                    continue;
                }
                updatedFiles.push(file);
            }

            state.allFiles = updatedFiles;
            state.allFilesChangesCounter++;
        },
        // allTags
        updateTags(state) {
            fetch(Params.Host + "/api/tags", {
                method: "GET",
                credentials: "same-origin"
            })
                .then(data => data.json())
                .then(tags => {
                    state.allTags.clear();

                    for (let id in tags) {
                        if (tags[id].name === undefined || tags[id].color === undefined) {
                            continue;
                        }

                        let t = new Tag();
                        t.name = tags[id].name;
                        t.color = tags[id].color;
                        state.allTags.set(Number(id), t);
                    }

                    state.tagsReady = true;
                    state.allTagsChangesCounter++;
                })
                .catch(err => logError(err));
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
                let file = objectToFile(f, true);
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
