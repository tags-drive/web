import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
// Classes and types
import { Store } from "./types";
import { File, Tag, FileExt } from "@app/global/classes";

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
        file.addTime = new Date(f.addTime);
    } else {
        file.addTime = f.addTime || new Date();
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
                let file = objectToFile(f);
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
                let file = objectToFile(f);
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

                let t = objectToTag(tags[id]);
                if (t !== null) {
                    state.allTags.set(Number(id), t);
                }
            }

            state.allTagsChangesCounter++;
        }
    }
};

export default new Vuex.Store(store);
