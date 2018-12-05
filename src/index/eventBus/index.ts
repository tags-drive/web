import Vue from "vue";

export const Events = {
    Search: {
        Usual: <string>"search-usual",
        Advanced: <string>"search-advanced"
    },
    ModalWindow: {
        ShowSettingsWindow: <string>"modal-window-settings-window",
        ShowTagsChangingWindow: <string>"modal-window-tags-changing",
        RegularMode: {
            ShowFileRenamingWindow: <string>"modal-window-regular-file-renaming",
            ShowFileDescriptionChangingWindow: <string>"modal-window-regular-file-description-changing",
            ShowTagsChangingWindow: <string>"modal-window-regular-tags-changing",
            ShowFileDeletingWindow: <string>"modal-window-regular-file-deleting"
        },
        SelectMode: {
            ShowTagsAddingWindow: <string>"modal-window-select-tags-adding",
            ShowTagsDeletingWindow: <string>"modal-window-select-tags-deleting",
            ShowFilesDeletingWindow: <string>"modal-window-select-files-deleting"
        }
    },
    FilesBlock: {
        // For children of TopBar
        SelectFile: <string>"files-block-select-file",
        UnselectFile: <string>"files-block-unselect-file",
        //
        UnselectAllFiles: <string>"files-block-unselect-all-files",
        //
        RestoreSortParams: <string>"files-block-restore-sort-params"
    },
    UpdateSelectedFiles: <string>"update-selected-files",
    ShowContextMenu: <string>"show-context-menu",
    ShowPreview: <string>"show-preview",
    LogEvent: <string>"log-event"
};

export const EventBus = new Vue({});
