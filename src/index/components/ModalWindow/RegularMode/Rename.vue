<template>
	<div>
		<div style="margin-bottom: 5px;">Current filename: "{{file.filename}}"</div>
		<input
			type="text"
			style="margin-bottom: 5px; width: 400px;"
			placeholder="New filename"
			v-model="newFilename">
		<br>
		<input class="btn" type="button" value="Rename" @click="rename">
	</div>
</template>

<style scoped>
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
