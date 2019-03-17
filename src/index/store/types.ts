import { Tag, File } from "@app/global/classes";

// Vue.js doesn't support reactive Map and Set, so we need to use special counter to
// update data reactively (https://github.com/vuejs/vue/issues/2410#issuecomment-318487855)
export interface Store {
    allFiles: File[];
    allFilesChangesCounter: number;
    //
    allTags: Map<number, Tag>;
    allTagsChangesCounter: number;
    //
    selectedFiles: File[];
    selectedFilesChangesCounter: number;
    //
    filesReady: boolean;
    tagsReady: boolean;
    selectedFilesReady: boolean;
}
