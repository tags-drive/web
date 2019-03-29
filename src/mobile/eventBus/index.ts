import Vue from "vue";

export const Events = {
    fetchNextFiles: "fetch-next-files",
    showPreview: "show-preview",
    resetFilesBlockScroll: "reset-files-block-scroll"
};

export const EventBus = new Vue({});
