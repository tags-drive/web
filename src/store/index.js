import Vue from "vue";
import Vuex from "vuex";
import dateformat from "dateformat";

import { Params } from "../global";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        allFiles: {},
        allTags: {},
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
                    // Change time from "2018-08-23T22:48:59.0459184+03:00" to "23-08-2018 22:48"
                    for (let i in files) {
                        files[i].addTime = dateformat(new Date(files[i].addTime), "dd-mm-yyyy HH:MM");
                    }
                    state.allFiles = files;
                })
                .catch(err => console.error(err)); // user can live without this error, so we won't use logError() here
        },
        setFiles(state, files) {
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
                .then(tags => (state.allTags = tags))
                .catch(err => console.error(err)); // user can live without this error, so we won't use logError() here
        },
        // selectedFiles
        // clearSelectedFiles must be called before setSelectedFiles
        clearSelectedFiles(state) {
            state.selectedFiles = null;
        },
        setSelectedFiles(state, files) {
            state.selectedFiles = files;
        }
    }
});
