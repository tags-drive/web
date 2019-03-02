import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
// Classes and types
import { Store } from "./types";
import { File, Tag, FileExt } from "@app/index/global";
// Other
import dateformat from "dateformat";
Vue.use(Vuex);

function objectToFile(f: any, skipTimeParsing?: boolean): File | null {
    if (
        f === undefined ||
        f.id === undefined ||
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

    if (
        f.type.ext === undefined ||
        f.type.fileType === undefined ||
        f.type.supported === undefined ||
        f.type.previewType === undefined
    ) {
        return null;
    }

    let ext = new FileExt();
    ext.ext = f.type.ext;
    ext.fileType = f.type.fileType;
    ext.supported = f.type.supported;
    ext.previewType = f.type.previewType;

    let file: File = new File();
    file.id = <number>f.id;
    file.type = ext;
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

function objectToTag(f: any): Tag | null {
    if (f === undefined || f.name === undefined || f.color === undefined) {
        return null;
    }

    return new Tag(<string>f.name, <string>f.color);
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
        setFiles(state, files: object[]) {
            let updatedFiles: File[] = [];

            for (let i = 0; i < files.length; i++) {
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
        setSingleFiles(state, f: any) {
            let file = objectToFile(f);
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

                let t = objectToTag(tags[id]);
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
