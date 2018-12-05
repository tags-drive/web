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

const store: StoreOptions<Store> = {
    state: {
        allFiles: [],
        allTags: new Map(),
        selectedFiles: []
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
                    state.allFiles = [];

                    // Change time from "2018-08-23T22:48:59.0459184+03:00" to "23-08-2018 22:48"
                    for (let i in files) {
                        let f = files[i];

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

                        state.allFiles.push(file);
                    }

                    state.allFiles = files;
                })
                .catch(err => logError(err));
        },
        setFiles(state, files: File[]) {
            // Change time from "2018-08-23T22:48:59.0459184+03:00" to "23-08-2018 22:48"
            for (let i in files) {
                files[i].addTime = dateformat(new Date(files[i].addTime), "dd-mm-yyyy HH:MM");
            }
            state.allFiles = files;
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
                })
                .catch(err => logError(err));
        },
        // selectedFiles
        // clearSelectedFiles must be called before setSelectedFiles
        clearSelectedFiles(state) {
            state.selectedFiles = [];
        },
        setSelectedFiles(state, files) {
            state.selectedFiles = files;
        }
    }
};

export default new Vuex.Store(store);
