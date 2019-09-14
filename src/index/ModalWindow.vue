<template>
	<div
		v-if="show"
		id="background"
		@click.self="hideWindow"
	>
		<div id="modal-window">
			<!-- Settings -->
			<div v-if="settingsMode" class="modal-window__input">
				<settings-menu></settings-menu>
			</div>
			<!-- Global tags mode -->
			<div v-else-if="globalTagsMode" class="modal-window__input">
				<global-tags-manager></global-tags-manager>
			</div>
			<!-- Regular rename mode -->
			<div v-else-if="regularRenameMode" class="modal-window__input">
				<regular-renaming :file="file"></regular-renaming>
			</div>
			<!-- Regular tags updating -->
			<div v-else-if="regularFileTagsMode" class="modal-window__input">
				<regular-tags-updating :file="file"></regular-tags-updating>
			</div>
			<!-- Regular description changing -->
			<div v-else-if="regularDescriptionMode" class="modal-window__input">
				<regular-description-changing :file="file"></regular-description-changing>
			</div>
			<!-- Regular delete mode -->
			<div v-else-if="regularDeleteMode" class="modal-window__input">
				<regular-file-deletnig :file="file"></regular-file-deletnig>
			</div>
			<!-- Select tags adding -->
			<div v-else-if="selectFilesTagsAddMode" class="modal-window__input">
				<select-tags-updating
					:selectedFiles="selectedFiles"
					:mode="SharedTagsChangingModes.addMode"
				></select-tags-updating>
			</div>
			<!-- Select tags deleting -->
			<div v-else-if="selectFilesTagsDeleteMode" class="modal-window__input">
				<select-tags-updating
					:selectedFiles="selectedFiles"
					:mode="SharedTagsChangingModes.deleteMode"
				></select-tags-updating>
			</div>
			<!-- Select delete mode -->
			<div v-else-if="selectDeleteMode" class="modal-window__input">
				<select-files-deleting :selectedFiles="selectedFiles"></select-files-deleting>
			</div>
		</div>
	</div>
</template>


<style scoped>
#background {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    left: 0;
    margin-bottom: 100px;
    overflow-y: auto;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 5;
}

#modal-window {
    background-color: #ffffff;
    border-radius: 5px;
    margin-bottom: 100px;
    margin-left: auto;
    margin-right: auto;
    padding: 10px;
    position: relative;
    top: 10vh;
    width: fit-content;
}

.modal-window__input {
    padding: 5px;
    text-align: center;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import Settings from "@components/ModalWindow/Settings.vue";
import GlobalTagsManager from "@components/ModalWindow/TagsManager/TagsManager.vue";
// Components: Regular Mode
import RegularRenaming from "@components/ModalWindow/RegularMode/Rename.vue";
import RegularTagsUpdating from "@components/ModalWindow/RegularMode/Tags.vue";
import RegularDescriptionChanging from "@components/ModalWindow/RegularMode/Description.vue";
import RegularFileDeletnig from "@components/ModalWindow/RegularMode/Delete.vue";
// Components: Select Mode
import SelectTagsUpdating from "@components/ModalWindow/SelectMode/Tags.vue";
import SelectFilesDeleting from "@components/ModalWindow/SelectMode/FilesDeleting.vue";
// Classes and types
import { File } from "@app/global/classes";
// Shared data
import SharedState, { setShowDropLayer } from "@app/index/state";
// Other
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/index/eventBus";

export default Vue.extend({
    data: function() {
        return {
            file: null as File | null,
            show: false,
            selectedFiles: [] as Array<File>,
            // Modes
            settingsMode: false,
            globalTagsMode: false,
            //
            regularRenameMode: false,
            regularFileTagsMode: false,
            regularDescriptionMode: false,
            regularDeleteMode: false,
            //
            selectFilesTagsAddMode: false,
            selectFilesTagsDeleteMode: false,
            selectDeleteMode: false,
            //
            SharedTagsChangingModes: Const.tagsChanging
        };
    },
    //
    components: {
        "settings-menu": Settings,
        "global-tags-manager": GlobalTagsManager,
        // Regular mode
        "regular-renaming": RegularRenaming,
        "regular-tags-updating": RegularTagsUpdating,
        "regular-description-changing": RegularDescriptionChanging,
        "regular-file-deletnig": RegularFileDeletnig,
        // Select mode
        "select-tags-updating": SelectTagsUpdating,
        "select-files-deleting": SelectFilesDeleting
    },
    //
    created: function() {
        EventBus.$on(Events.ModalWindow.HideWindow, () => {
            this.hideWindow();
        });
        //
        EventBus.$on(Events.ModalWindow.ShowSettingsWindow, () => {
            this.settingsMode = true;
            this.showWindow();
        });
        EventBus.$on(Events.ModalWindow.ShowTagsChangingWindow, () => {
            this.globalTagsMode = true;
            this.showWindow();
        });
        // Regular
        EventBus.$on(Events.ModalWindow.RegularMode.ShowFileRenamingWindow, (payload: any) => {
            this.file = payload.file;
            this.regularRenameMode = true;
            this.showWindow();
        });
        EventBus.$on(Events.ModalWindow.RegularMode.ShowTagsChangingWindow, (payload: any) => {
            this.file = payload.file;
            this.regularFileTagsMode = true;
            this.showWindow();
        });
        EventBus.$on(Events.ModalWindow.RegularMode.ShowFileDescriptionChangingWindow, (payload: any) => {
            this.file = payload.file;
            this.regularDescriptionMode = true;
            this.showWindow();
        });
        EventBus.$on(Events.ModalWindow.RegularMode.ShowFileDeletingWindow, (payload: any) => {
            this.file = payload.file;
            this.regularDeleteMode = true;
            this.showWindow();
        });
        // Selected
        EventBus.$on(Events.ModalWindow.SelectMode.ShowTagsAddingWindow, (payload: any) => {
            this.selectedFiles = payload.files;
            this.selectFilesTagsAddMode = true;
            this.showWindow();
        });
        EventBus.$on(Events.ModalWindow.SelectMode.ShowTagsDeletingWindow, (payload: any) => {
            this.selectedFiles = payload.files;
            this.selectFilesTagsDeleteMode = true;
            this.showWindow();
        });
        EventBus.$on(Events.ModalWindow.SelectMode.ShowFilesDeletingWindow, (payload: any) => {
            this.selectedFiles = payload.files;
            this.selectDeleteMode = true;
            this.showWindow();
        });
    },
    //
    methods: {
        // UI
        showWindow() {
            setShowDropLayer(false);
            SharedState.commit("showModalWindow");
            this.addListener();
            this.show = true;
        },
        hideWindow() {
            this.settingsMode = false;
            this.globalTagsMode = false;
            this.regularRenameMode = false;
            this.regularFileTagsMode = false;
            this.regularDescriptionMode = false;
            this.regularDeleteMode = false;
            this.selectFilesTagsAddMode = false;
            this.selectFilesTagsDeleteMode = false;
            this.selectDeleteMode = false;

            this.show = false;

            this.removeListener();

            setShowDropLayer(true);
            SharedState.commit("hideModalWindow");
        },
        // Listener
        addListener() {
            document.addEventListener("keydown", this.onkeydownListener);
        },
        removeListener() {
            document.removeEventListener("keydown", this.onkeydownListener);
        },
        onkeydownListener(event: KeyboardEvent) {
            if (event.key === "Escape") {
                this.hideWindow();
            }
        }
    }
});
</script>
