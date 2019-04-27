import Vue from "vue";

export const Events = {
    Search: {
        /**
         * Payload: -
         */
        Usual: "search-usual",
        /**
         * Payload:
         * - type - sort type (from Const object)
         * - order - sort order (from Const object)
         */
        Advanced: "search-advanced"
    },
    ModalWindow: {
        /**
         * Payload: -
         */
        HideWindow: "modal-window-hide",
        /**
         * Payload: -
         */
        ShowSettingsWindow: "modal-window-settings-window",
        /**
         * Payload: -
         */
        ShowTagsChangingWindow: "modal-window-tags-changing",
        RegularMode: {
            /**
             * Payload:
             * - file - instance of File class
             */
            ShowFileRenamingWindow: "modal-window-regular-file-renaming",
            /**
             * Payload:
             * - file - instance of File class
             */
            ShowFileDescriptionChangingWindow: "modal-window-regular-file-description-changing",
            /**
             * Payload:
             * - file - instance of File class
             */
            ShowTagsChangingWindow: "modal-window-regular-tags-changing",
            /**
             * Payload:
             * - file - instance of File class
             */
            ShowFileDeletingWindow: "modal-window-regular-file-deleting"
        },
        SelectMode: {
            /**
             * Payload:
             * - files - array of instances of File class
             */
            ShowTagsAddingWindow: "modal-window-select-tags-adding",
            /**
             * Payload:
             * - files - array of instances of File class
             */
            ShowTagsDeletingWindow: "modal-window-select-tags-deleting",
            /**
             * Payload:
             * - files - array of instances of File class
             */
            ShowFilesDeletingWindow: "modal-window-select-files-deleting"
        }
    },
    FilesBlock: {
        /**
         * Payload:
         * - id - file id
         */
        SelectFile: "files-block-select-file",
        /**
         * Payload:
         * - id - file id
         */
        UnselectFile: "files-block-unselect-file",
        /**
         * Use this event to unfocus file after click by right button
         *
         * Payload: -
         */
        UnfocusFile: "files-block-unfocus-file",
        /**
         * Payload: -
         */
        UnselectAllFiles: "files-block-unselect-all-files",
        /**
         * Payload: -
         */
        RestoreSortParams: "files-block-restore-sort-params"
    },
    /**
     * Use this event to update selectedFiles in store
     *
     * Payload: -
     */
    UpdateSelectedFiles: "update-selected-files",
    /**
     * Payload:
     * - file - instance of File class
     * - x - x coordinate
     * - y - y coordinate
     */
    ShowContextMenu: "show-context-menu",
    /**
     * Payload:
     * - file - instance of File class
     */
    ShowPreview: "show-preview",
    /**
     * Payload:
     * - type - type of event (from Const.logType)
     * - msg - message to log
     */
    LogEvent: "log-event"
};

export const EventBus = new Vue({});
