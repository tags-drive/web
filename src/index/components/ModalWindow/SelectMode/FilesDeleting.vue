<template>
	<div style="width: 500px;">
		<div style="font-size: 20px;">Selected files:</div>
		<br>
		<div style="text-align: left; max-height: 160px; overflow-y: auto;">
			<ul>
				<li	v-for="(file, index) in selectedFiles" :key="index">{{file.filename}}</li>
			</ul>
		</div>

		<div style="border-bottom: 1px solid #00000040; width: 90%; margin: 20px auto 20px auto;"></div>

		<input
			type="button"
			class="btn deleteBtn"
			style="height: 50px; width: 120px;"
			value="Add into Trash"
			title="Files will be deleted in 7 days"
			@click="deleteSelectedFiles">

		<input
			type="button"
			class="btn recoverBtn"
			style="height: 50px; width: 120px; margin-left: 10px;"
			value="Recover"
			title="Files will be removed from Trash"
			@click="recoverSelectedFiles">

		<br>

		<!--  Force delete -->
		<input
			type="button"
			class="btn deleteForeverBtn"
			style="height: 30px; width: 130px; margin-top: 20px;"
			value="Delete files forever"
			title="This action can not be undone"
			@click="deleteSelectedFilesForever">
	</div>
</template>


<style scoped>
.btn {
    border: none;
    border-radius: 5px;
}

.deleteBtn {
    background-color: rgba(255, 0, 0, 0.6);
}

.deleteBtn:hover {
    background-color: rgba(255, 0, 0, 0.7);
}

.deleteForeverBtn {
    background-color: rgba(222, 0, 0, 0.2);
}

.deleteForeverBtn:hover {
    background-color: rgba(222, 0, 0, 0.7);
}

.recoverBtn {
    background-color: rgba(0, 200, 0, 0.6);
}

.recoverBtn:hover {
    background-color: rgba(0, 200, 0, 0.7);
}
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { File } from "@app/global/classes";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import API from "@app/index/api";

export default Vue.extend({
    props: {
        selectedFiles: Array as () => Array<File>
    },
    //
    methods: {
        deleteSelectedFiles() {
            let ids = new Array<number>(this.selectedFiles.length);
            this.selectedFiles.forEach((elem, i) => (ids[i] = elem.id));
            API.files.delete(ids, false);
            this.hideWindow();

            // If we don't call this function, next files will become selected.
            EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
        },
        // deleteSelectedFilesForever is a wrapper over deleteFile
        deleteSelectedFilesForever() {
            let ids = new Array<number>(this.selectedFiles.length);
            this.selectedFiles.forEach((elem, i) => (ids[i] = elem.id));
            API.files.delete(ids, true);
            this.hideWindow();

            // If we don't call this function, next files will become selected.
            EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
        },
        recoverSelectedFiles() {
            let ids: number[] = new Array<number>(this.selectedFiles.length);
            this.selectedFiles.forEach((elem, i) => (ids[i] = elem.id));
            API.files.recover(ids);
            this.hideWindow();

            EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
        },
        hideWindow() {
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
