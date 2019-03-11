<template>
	<div>
		<div class="section">Current filename: "{{file.filename}}"</div>

		<div class="section">
			<input
				type="text"
				style="margin-bottom: 5px; width: 400px; font-size: 15px;"
				placeholder="New filename"
				v-model="newFilename">
		</div>

		<div class="section">
			<input class="btn" type="button" value="Rename" @click="rename">
		</div>
	</div>
</template>

<style scoped>
.section {
    margin-bottom: 10px;
}

.section:last-child {
    margin-bottom: 0;
}

.btn {
    height: 25px;
    font-size: 15px;
    width: 100px;
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
    newFilename: string = "";

    created() {
        this.newFilename = this.file.filename;
    }

    rename() {
        API.files.changeName(this.file.id, this.newFilename);
        this.hideWindow();
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>
