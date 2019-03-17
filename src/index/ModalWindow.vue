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
				<global-tags-changing></global-tags-changing>
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
    z-index: 6;
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
    width: 600px;
}

.modal-window__input {
    padding: 5px;
    text-align: center;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import Settings from "@components/ModalWindow/Settings.vue";
import GlobalTagsChanging from "@components/ModalWindow/TagsChanging.vue";
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
import SharedState from "@app/index/state";
// Other
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/index/eventBus";

@Component({
    components: {
        "settings-menu": Settings,
        "global-tags-changing": GlobalTagsChanging,
        // Regular mode
        "regular-renaming": RegularRenaming,
        "regular-tags-updating": RegularTagsUpdating,
        "regular-description-changing": RegularDescriptionChanging,
        "regular-file-deletnig": RegularFileDeletnig,
        // Select mode
        "select-tags-updating": SelectTagsUpdating,
        "select-files-deleting": SelectFilesDeleting
    }
})
export default class extends Vue {
    file: File | null = null;
    show: boolean = false;
    selectedFiles: File[] = [];
    // Modes
    settingsMode: boolean = false;
    globalTagsMode: boolean = false;
    //
    regularRenameMode: boolean = false;
    regularFileTagsMode: boolean = false;
    regularDescriptionMode: boolean = false;
    regularDeleteMode: boolean = false;
    //
    selectFilesTagsAddMode: boolean = false;
    selectFilesTagsDeleteMode: boolean = false;
    selectDeleteMode: boolean = false;
    //
    SharedTagsChangingModes = Const.tagsChanging;

    created() {
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
    }

    // UI
    showWindow() {
        SharedState.commit("hideDropLayer");
        SharedState.commit("showModalWindow");
        this.addListener();
        this.show = true;
    }
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

        SharedState.commit("showDropLayer");
        SharedState.commit("hideModalWindow");
    }

    // Listener
    addListener() {
        document.addEventListener("keydown", this.onkeydownListener);
    }
    removeListener() {
        document.removeEventListener("keydown", this.onkeydownListener);
    }
    onkeydownListener(event: KeyboardEvent) {
        if (event.key === "Escape") {
            this.hideWindow();
        }
    }
}
</script>
