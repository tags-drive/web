import Vue from "vue";

export const Events = {
    // Search
    UsualSearch: "usual-search",
    AdvancedSearch: "advanced-search",
    //
    GlobalTagsChanging: "global-tags-changing",
    // Regular mode
    RegularFileRenaming: "regular-file-renaming",
    RegularDescriptionChanging: "regular-file-description-changing",
    RegularTagsChanging: "regular-tags-changing",
    RegularFileDeleting: "regular-file-deleting",
    // Select mode
    SelectTagsAdding: "select-tags-adding",
    SelectTagsDeleting: "select-tags-deleting",
    SelectFilesDeleting: "select-files-deleting",
    //
    UpdateSelectedFiles: "update-selected-files",
    ResetSortParams: "reset-sort-params",
    ShowContextMenu: "show-context-menu",
	UnselectAllFiles: "unselect-all-files",
	LogEvent: "log-event",
	ShowPreview: "show-preview"
};

export const EventBus = new Vue({});
