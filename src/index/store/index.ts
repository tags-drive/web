import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import dateformat from "dateformat";
//
import { File, Tag } from "../global";
import { Store } from "./types";
//
import { Params } from "../../global";
import { logError } from "../tools";

Vue.use(Vuex);

function objectToFile(f: any): File | null {
    if (
        f == undefined ||
        f.type == undefined ||
        f.filename == undefined ||
        f.origin == undefined ||
        f.description == undefined ||
        f.size == undefined ||
        f.tags == undefined ||
        f.addTime == undefined ||
        // Preview can be omitted
        f.deleted == undefined ||
        f.timeToDelete == undefined
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
    file.addTime = dateformat(new Date(f.addTime), "dd-mm-yyyy HH:MM");
    file.preview = <string>f.preview;
    file.deleted = <boolean>f.deleted;
    file.timeToDelete = <number>f.timeToDelete;

    return file;
}

const store: StoreOptions<Store> = {
    state: {
        allFiles: [],
        allTags: new Map(),
        selectedFiles: [],
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

                    state.allFiles = updatedFiles;
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
                        if (tags[id].name == undefined || tags[id].color == undefined) {
                            continue;
                        }

                        let t = new Tag();
                        t.name = tags[id].name;
                        t.color = tags[id].color;
                        state.allTags.set(Number(id), t);
                    }

                    state.tagsReady = true;
                })
                .catch(err => logError(err));
        },
        // selectedFiles
        //
        // clearSelectedFiles must be called before setSelectedFiles
        clearSelectedFiles(state) {
            state.selectedFiles = [];
            state.selectedFilesReady = false;
        },
        setSelectedFiles(state, files: object[]) {
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

            state.selectedFilesReady = true;
        }
    }
};

export default new Vuex.Store(store);
