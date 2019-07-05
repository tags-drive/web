<template>
	<div id="files-block-wrapper">

		<div
			v-if="allFiles.length === 0"
			id="nothing-found"
			class="noselect"
		>No files to display</div>

		<!-- Pass all data -->
		<files-list
			v-else-if="State.settings.viewMode === viewModes.list"

			:allFiles="allFiles"
			:sortType="sortType"
			:sortOrder="sortOrder"
		></files-list>

		<cards
			v-else-if="State.settings.viewMode === viewModes.cards"

			:allFiles="allFiles"
			:sortType="sortType"
			:sortOrder="sortOrder"
		></cards>
	</div>
</template>


<style lang="scss" scoped>
#files-block-wrapper {
    height: calc(100vh - 51px);
    overflow: auto;
    overflow-x: hidden;

    > #nothing-found {
        border: 1px solid #88888840;
        border-radius: 10px;
        font-size: 30px;
        margin: 100px auto 0;
        padding: 10px;
        text-align: center;
        width: fit-content;
    }
}
</style>


<script lang="ts">
// This component just keeps state for render components (List.vue and Cards.vue)

import Vue from "vue";
// Components
import FilesListComponent from "@components/Files/List/List.vue";
import CardsComponent from "@components/Files/Cards/Cards.vue";
// Classes and types
import { File } from "@app/global/classes";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
import { State, ViewModes } from "@app/index/state/types";
// Other
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/index/eventBus";

export const InternalEventBus = new Vue({});
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
     * Payload: -
     */
    ToggleAllFiles: "files-block-toggle-all-files",
    /**
     * Payload: -
     */
    UnselectAllFiles: "files-block-unselect-all-files"
};

// Internal class. Only singleton must be exported
class _selectedFilesIDs {
    // Properties
    private ids: Set<number> = new Set();
    private _changeCounter: number = 0;
    //
    public get size(): number {
        return this.ids.size;
    }
    public get changeCounter(): number {
        return this._changeCounter;
    }

    // Methods
    private registerChange() {
        this._changeCounter++;
    }
    //
    check(id: number): boolean {
        // console.log(this.ids);
        return this.ids.has(id);
    }
    add(id: number) {
        this.ids.add(id);
        this.registerChange();
    }
    delete(id: number) {
        this.ids.delete(id);
        this.registerChange();
    }
    clear() {
        this.ids.clear();
        this.registerChange();
    }
}

export const SelectedFilesIDs = new _selectedFilesIDs();

export default Vue.extend({
    components: {
        "files-list": FilesListComponent,
        cards: CardsComponent
    },
    //
    data: function() {
        return {
            sortType: Const.sortType.name,
            sortOrder: Const.sortOrder.asc,
            //
            lastSortType: Const.sortType.name,
            //
            Store: SharedStore.state,
            State: SharedState.state,
            viewModes: {
                cards: ViewModes.cards.value,
                list: ViewModes.list.value
            }
        };
    },
    computed: {
        allFiles: function(): File[] {
            // For reactive updating (see @app/index/store/types.ts for more information)
            let reactive = this.Store.allFilesChangesCounter;

            return this.Store.allFiles;
        }
    },
    //
    created: function() {
        // Ctrl+A or Esc
        window.addEventListener("keydown", ev => {
            if (
                // Disable when Modal Window is displaying
                !this.State.showModalWindow &&
                // Disable when target is input and etc.
                ev.target === document.body
            ) {
                // Ctrl + A
                if (ev.code == "KeyA" && ev.ctrlKey) {
                    ev.preventDefault();
                    this.selectAllFiles();
                }
                // Esc
                else if (ev.code === "Escape" && SelectedFilesIDs.size > 0) {
                    this.unselectAllFiles();
                }
            }
        });

        // Global events

        EventBus.$on(Events.UpdateSelectedFiles, () => {
            this.updateSelectedFiles();
        });

        EventBus.$on(Events.FilesBlock.UnselectAllFiles, () => {
            this.unselectAllFiles();
        });

        EventBus.$on(Events.FilesBlock.RestoreSortParams, () => {
            this.sort().restoreDefault();
        });

        // Internal events (for children)

        InternalEventBus.$on(InternalEvents.ToggleAllFiles, () => {
            this.toggleAllFiles();
        });
        InternalEventBus.$on(InternalEvents.SelectFile, (payload: any) => {
            if (payload.id === undefined) {
                return;
            }
            this.selectFile(<number>payload.id);
        });
        InternalEventBus.$on(InternalEvents.UnselectFile, (payload: any) => {
            if (payload.id === undefined) {
                return;
            }
            this.unselectFile(<number>payload.id);
        });
        // Sorts
        InternalEventBus.$on(InternalEvents.Sort.Manually, (payload: any) => {
            if (payload.type === undefined || payload.order === undefined) {
                return;
            }

            this.sort().manually(String(payload.type), String(payload.order));
        });
        InternalEventBus.$on(InternalEvents.Sort.ByName, () => {
            this.sort().byName();
        });
        InternalEventBus.$on(InternalEvents.Sort.BySize, () => {
            this.sort().bySize();
        });
        InternalEventBus.$on(InternalEvents.Sort.ByTime, () => {
            this.sort().byTime();
        });
        InternalEventBus.$on(InternalEvents.Sort.RestoreDefault, () => {
            this.sort().restoreDefault();
        });
    },
    //
    methods: {
        // Sorts
        sort: function() {
            let checkSortType = (type: string): boolean => {
                return type === Const.sortType.name || type === Const.sortType.size || type === Const.sortType.time;
            };

            let checkSortOrder = (order: string): boolean => {
                return order === Const.sortOrder.asc || order === Const.sortOrder.desc;
            };

            return {
                manually: (type: string, order: string) => {
                    if (!checkSortType(type) || !checkSortOrder(order)) {
                        // Reject the update if type or order is invalid
                        return;
                    }

                    this.sortType = type;
                    this.lastSortType = this.sortType;

                    this.sortOrder = order;

                    EventBus.$emit(Events.Search.Advanced, { type: this.sortType, order: this.sortOrder });
                },
                byName: () => {
                    if (this.lastSortType === Const.sortType.name) {
                        // Just invert sort order
                        this.sortOrder =
                            this.sortOrder === Const.sortOrder.asc ? Const.sortOrder.desc : Const.sortOrder.asc;
                    } else {
                        this.sortType = Const.sortType.name;
                        this.lastSortType = this.sortType;

                        this.sortOrder = Const.sortOrder.asc;
                    }

                    EventBus.$emit(Events.Search.Advanced, { type: this.sortType, order: this.sortOrder });
                },
                bySize: () => {
                    if (this.lastSortType === Const.sortType.size) {
                        // Just invert sort order
                        this.sortOrder =
                            this.sortOrder === Const.sortOrder.asc ? Const.sortOrder.desc : Const.sortOrder.asc;
                    } else {
                        this.sortType = Const.sortType.size;
                        this.lastSortType = this.sortType;

                        this.sortOrder = Const.sortOrder.asc;
                    }

                    EventBus.$emit(Events.Search.Advanced, { type: this.sortType, order: this.sortOrder });
                },
                byTime: () => {
                    if (this.lastSortType === Const.sortType.time) {
                        // Just invert sort order
                        this.sortOrder =
                            this.sortOrder === Const.sortOrder.asc ? Const.sortOrder.desc : Const.sortOrder.asc;
                    } else {
                        this.sortType = Const.sortType.time;
                        this.lastSortType = this.sortType;

                        this.sortOrder = Const.sortOrder.asc;
                    }

                    EventBus.$emit(Events.Search.Advanced, { type: this.sortType, order: this.sortOrder });
                },
                restoreDefault: () => {
                    this.sortType = Const.sortType.name;
                    this.lastSortType = this.sortType;

                    this.sortOrder = Const.sortOrder.asc;
                }
            };
        },

        // Select mode
        toggleAllFiles: function() {
            if (this.allFiles.length === SelectedFilesIDs.size) {
                // All files are selected
                this.unselectAllFiles();
            } else {
                this.selectAllFiles();
            }
        },
        selectAllFiles: function() {
            if (this.allFiles.length === SelectedFilesIDs.size) {
                return;
            }

            const allFiles = this.allFiles;
            for (let i = 0; i < allFiles.length; i++) {
                SelectedFilesIDs.add(allFiles[i].id);
            }

            SharedState.commit("setSelectMode");
        },
        unselectAllFiles: function() {
            SelectedFilesIDs.clear();
            SharedState.commit("unsetSelectMode");
        },

        // updateSelectedFiles updates list of selectedFiles in Store
        updateSelectedFiles: function() {
            let selectedFiles = this.allFiles.filter(f => {
                return SelectedFilesIDs.check(f.id);
            });

            SharedStore.commit("setSelectedFiles", selectedFiles);
        },

        // For children
        selectFile: function(id: number) {
            SelectedFilesIDs.add(id);
            SharedState.commit("setSelectMode");
        },
        unselectFile: function(id: number) {
            SelectedFilesIDs.delete(id);
            if (SelectedFilesIDs.size === 0) {
                SharedState.commit("unsetSelectMode");
            }
        }
    }
});
</script>
