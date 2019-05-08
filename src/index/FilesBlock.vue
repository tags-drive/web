<template>
	<div id="files-block-wrapper">

		<!-- Pass all data -->
		<files-list
			:allFiles="allFiles"
			:allSelected="allSelected"
			:selectedFilesCounter="selectedFilesCounter"
			:sortModeByName="sortModeByName"
			:sortModeBySize="sortModeBySize"
			:sortModeByTime="sortModeByTime"
			:sortOrderAsc="sortOrderAsc"
			:sortOrderDesc="sortOrderDesc"
		></files-list>

	</div>
</template>

<style lang="scss" scoped>
#files-block-wrapper {
    height: calc(100vh - 51px);
    overflow: auto;
    overflow-x: hidden;
}
</style>


<script lang="ts">
// This component just keeps state for render components (List.vue and Cards.vue)

import Vue from "vue";
// Components
import FilesListComponent from "@components/FilesBlock/List/List.vue";
// Classes and types
import { File } from "@app/global/classes";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
import { State } from "@app/index/state/types";
// Other
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/index/eventBus";

export class TableFile extends File {
    selected: boolean;

    constructor(f: File) {
        super();

        this.id = f.id;
        this.type = f.type;
        this.filename = f.filename;
        this.description = f.description;
        this.size = f.size;
        this.tags = f.tags;
        this.origin = f.origin;
        this.preview = f.preview;
        this.addTime = f.addTime;
        this.deleted = f.deleted;
        this.timeToDelete = f.timeToDelete;
        //
        this.selected = false;
    }
}

export const InternalEvents = {
    Sort: {
        /**
         * Payload:
         * - type - sort type
         * - order - sort order
         */
        Manually: "files-block-sort-manually",
        /**
         * Payload: -
         */
        ByName: "files-block-sort-by-name",
        /**
         * Payload: -
         */
        BySize: "files-block-sort-by-size",
        /**
         * Payload: -
         */
        ByTime: "files-block-sort-by-time",
        /**
         * Payload: -
         */
        RestoreDefault: "files-block-sort-restore-default"
    },
    /**
     * Payload: -
     */
    ToggleAllFiles: "files-block-toggle-all-files",
    /**
     * Payload: -
     */
    UnselectAllFiles: "files-block-unselect-all-files"
};

export default Vue.extend({
    components: {
        "files-list": FilesListComponent
    },
    //
    data: function() {
        return {
            // For select mode
            allSelected: false,
            selectedFilesCounter: 0,
            //
            // Sort modes
            sortModeByName: true,
            sortModeBySize: false,
            sortModeByTime: false,
            //
            sortOrderAsc: true,
            sortOrderDesc: false,
            //
            lastSortType: Const.sortType.name,
            //
            Store: SharedStore.state
        };
    },
    computed: {
        allFiles: function(): TableFile[] {
            // For reactive updating (see @app/index/store/types.ts for more information)
            let reactive = this.Store.allFilesChangesCounter;

            let allFiles: TableFile[] = [];
            this.Store.allFiles.forEach((f, i) => {
                if (!f.deleted || SharedState.state.settings.showDeletedFiles) {
                    allFiles.push(new TableFile(f));
                }
            });

            return allFiles;
        }
    },
    //
    created: function() {
        // Global events

        EventBus.$on(Events.UpdateSelectedFiles, () => {
            this.updateSelectedFiles();
        });

        EventBus.$on(Events.FilesBlock.UnselectAllFiles, () => {
            this.unselectAllFiles();
        });

        EventBus.$on(Events.FilesBlock.SelectFile, (payload: any) => {
            if (payload.id === undefined) {
                return;
            }
            this.selectFile(<number>payload.id);
        });

        EventBus.$on(Events.FilesBlock.UnselectFile, (payload: any) => {
            if (payload.id === undefined) {
                return;
            }
            this.unselectFile(<number>payload.id);
        });

        // Internal events (for children)

        this.$on(InternalEvents.ToggleAllFiles, () => {
            this.toggleAllFiles();
        });

        // Sorts
        this.$on(InternalEvents.Sort.Manually, (payload: any) => {
            if (payload.type === undefined || payload.order === undefined) {
                return;
            }

            this.sort().manually(String(payload.type), String(payload.order));
        });
        this.$on(InternalEvents.Sort.ByName, () => {
            this.sort().byName();
        });

        this.$on(InternalEvents.Sort.BySize, () => {
            this.sort().bySize();
        });

        this.$on(InternalEvents.Sort.ByTime, () => {
            this.sort().byTime();
        });

        this.$on(InternalEvents.Sort.RestoreDefault, () => {
            this.sort().restoreDefault();
        });
    },
    //
    methods: {
        // Sorts
        sort: function() {
            return {
                manually: (type: string, order: string) => {
                    // Reset
                    this.sortModeByName = false;
                    this.sortModeBySize = false;
                    this.sortModeByTime = false;
                    this.sortOrderAsc = false;
                    this.sortOrderDesc = false;

                    switch (type) {
                        case Const.sortType.name:
                            this.sortModeByName = true;
                            break;
                        case Const.sortType.size:
                            this.sortModeBySize = true;
                            break;
                        case Const.sortType.time:
                            this.sortModeByTime = true;
                            break;
                        default:
                            this.sortModeByName = true;
                    }

                    switch (order) {
                        case Const.sortOrder.asc:
                            this.sortOrderAsc = true;
                            break;
                        case Const.sortOrder.desc:
                            this.sortOrderDesc = true;
                            break;
                        default:
                            this.sortOrderAsc = true;
                    }

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                byName: () => {
                    if (this.lastSortType === Const.sortType.name) {
                        // Just invert order
                        this.sortOrderAsc = !this.sortOrderAsc;
                        this.sortOrderDesc = !this.sortOrderDesc;
                    } else {
                        this.sortOrderAsc = true;
                        this.sortOrderDesc = false;
                    }
                    this.sortModeByName = true;
                    this.sortModeBySize = false;
                    this.sortModeByTime = false;
                    this.lastSortType = Const.sortType.name;

                    let type = this.lastSortType,
                        order = this.sortOrderAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                bySize: () => {
                    if (this.lastSortType === Const.sortType.size) {
                        // Just invert order
                        this.sortOrderAsc = !this.sortOrderAsc;
                        this.sortOrderDesc = !this.sortOrderDesc;
                    } else {
                        this.sortOrderAsc = true;
                        this.sortOrderDesc = false;
                    }
                    this.sortModeByName = false;
                    this.sortModeBySize = true;
                    this.sortModeByTime = false;

                    this.lastSortType = Const.sortType.size;

                    let type = this.lastSortType,
                        order = this.sortOrderAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                byTime: () => {
                    if (this.lastSortType === Const.sortType.time) {
                        // Just invert order
                        this.sortOrderAsc = !this.sortOrderAsc;
                        this.sortOrderDesc = !this.sortOrderDesc;
                    } else {
                        this.sortOrderAsc = true;
                        this.sortOrderDesc = false;
                    }
                    this.sortModeByName = false;
                    this.sortModeBySize = false;
                    this.sortModeByTime = true;
                    this.lastSortType = Const.sortType.time;

                    let type = this.lastSortType,
                        order = this.sortOrderAsc ? Const.sortOrder.asc : Const.sortOrder.desc;

                    EventBus.$emit(Events.Search.Advanced, { type: type, order: order });
                },
                restoreDefault: () => {
                    this.sortModeByName = true;
                    this.sortModeBySize = false;
                    this.sortModeByTime = false;
                    //
                    this.sortOrderAsc = true;
                    this.sortOrderDesc = false;
                }
            };
        },

        // Select mode
        toggleAllFiles: function() {
            if (!this.allSelected) {
                this.selectedFilesCounter = this.allFiles.length;
                this.allSelected = true;
                SharedState.commit("setSelectMode");

                this.allFiles.forEach((f, i) => {
                    this.allFiles[i].selected = true;
                });
            } else {
                this.unselectAllFiles();
            }
        },
        unselectAllFiles: function() {
            this.selectedFilesCounter = 0;
            this.allFiles.forEach((f, i) => {
                this.allFiles[i].selected = false;
            });

            this.allSelected = false;
            SharedState.commit("unsetSelectMode");
        },

        // updateSelectedFiles updates list of selectedFiles in Store
        updateSelectedFiles: function() {
            let selectedFiles: File[] = [];

            this.allFiles.forEach((f, i) => {
                if (this.allFiles[i].selected) {
                    selectedFiles.push(f);
                }
            });

            SharedStore.commit("setSelectedFiles", selectedFiles);
        },

        // For children
        selectFile: function(id: number) {
            this.selectedFilesCounter++;
            SharedState.commit("setSelectMode");

            for (let i = 0; i < this.allFiles.length; i++) {
                if (this.allFiles[i].id === id) {
                    this.allFiles[i].selected = true;
                }
            }

            if (this.selectedFilesCounter === this.allFiles.length) {
                this.allSelected = true;
            }
        },
        unselectFile: function(id: number) {
            this.selectedFilesCounter--;
            this.allSelected = false;
            for (let i = 0; i < this.allFiles.length; i++) {
                if (this.allFiles[i].id === id) {
                    this.allFiles[i].selected = false;
                }
            }

            if (this.selectedFilesCounter === 0) {
                SharedState.commit("unsetSelectMode");
            }
        }
    }
});
</script>
