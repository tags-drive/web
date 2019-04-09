import Vue from "vue";

export const Events = {
    refreshFiles: "refresh-files",
    fetchNextFiles: "fetch-next-files",
    showPreview: "show-preview",
    resetFilesBlockScroll: "reset-files-block-scroll"
};

export const EventBus = new Vue({});
