import Vue from "vue";

export const Events = {
    Search: {
        Usual: "search-usual",
        Advanced: "search-advanced"
    },
    ModalWindow: {
        HideWindow: "modal-window-hide",
        ShowSettingsWindow: "modal-window-settings-window",
        ShowTagsChangingWindow: "modal-window-tags-changing",
        RegularMode: {
            ShowFileRenamingWindow: "modal-window-regular-file-renaming",
            ShowFileDescriptionChangingWindow: "modal-window-regular-file-description-changing",
            ShowTagsChangingWindow: "modal-window-regular-tags-changing",
            ShowFileDeletingWindow: "modal-window-regular-file-deleting"
        },
        SelectMode: {
            ShowTagsAddingWindow: "modal-window-select-tags-adding",
            ShowTagsDeletingWindow: "modal-window-select-tags-deleting",
            ShowFilesDeletingWindow: "modal-window-select-files-deleting"
        }
    },
    FilesBlock: {
        // For children of TopBar
        SelectFile: "files-block-select-file",
        UnselectFile: "files-block-unselect-file",
        // Use this event to unfocus file after click by right button
        UnfocusFile: "files-block-unfocus-file",
        //
        UnselectAllFiles: "files-block-unselect-all-files",
        //
        RestoreSortParams: "files-block-restore-sort-params"
    },
    // Use this event to update selectedFiles in store
    UpdateSelectedFiles: "update-selected-files",
    ShowContextMenu: "show-context-menu",
    ShowPreview: "show-preview",
    LogEvent: "log-event"
};

export const EventBus = new Vue({});
