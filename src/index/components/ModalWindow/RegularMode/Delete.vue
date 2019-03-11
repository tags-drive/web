<template>
	<div>
		<!-- Delete -->
		<input v-if="!file.deleted"
			type="button"
			class="btn deleteBtn"
			style="height: 50px; width: 120px;"
			value="Add into Trash"
			title="File will be deleted in 7 days"
			@click="deleteFile">

		<!-- Recover -->
		<input v-else
			type="button"
			class="btn recoverBtn"
			style="height: 50px; width: 120px;"
			value="Recover"
			title="File will be removed from Trash"
			@click="recoverFile">

		<br>

		<!--  Force delete -->
		<input
			type="button"
			class="btn deleteForeverBtn"
			style="height: 30px; width: 120px; margin-top: 20px; left: 5px;"
			value="Delete file forever"
			title="This action can not be undone"
			@click="deleteFileForever">
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
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Classes and types
import { File } from "@app/index/global";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import API from "@app/index/api";

@Component({})
export default class extends Vue {
    @Prop() file!: File;

    deleteFile() {
        let ids = [this.file.id];
        API.files.delete(ids, false);

        this.hideWindow();
    }

    // deleteFileForever is a wrapper over deleteFile
    deleteFileForever() {
        let ids = [this.file.id];
        API.files.delete(ids, true);

        this.hideWindow();
    }

    recoverFile() {
        let ids = [this.file.id];
        API.files.recover(ids);

        this.hideWindow();
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>
