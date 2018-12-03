import Vue from "vue";

export const Events = {
	// Search
    UsualSearch: <string> "usual-search",
    AdvancedSearch: <string> "advanced-search",
    //
    SettingsMenu: <string> "settings-menu",
    //
    GlobalTagsChanging: <string> "global-tags-changing",
    // Regular mode
    RegularFileRenaming: <string> "regular-file-renaming",
    RegularDescriptionChanging: <string> "regular-file-description-changing",
    RegularTagsChanging: <string> "regular-tags-changing",
    RegularFileDeleting: <string> "regular-file-deleting",
    // Select mode
    SelectTagsAdding: <string> "select-tags-adding",
    SelectTagsDeleting: <string> "select-tags-deleting",
    SelectFilesDeleting: <string> "select-files-deleting",
    //
    UpdateSelectedFiles: <string> "update-selected-files",
    ResetSortParams: <string> "reset-sort-params",
    ShowContextMenu: <string> "show-context-menu",
    UnselectAllFiles: <string> "unselect-all-files",
    LogEvent: <string> "log-event",
    ShowPreview: <string> "show-preview"
}

export const EventBus = new Vue({});
