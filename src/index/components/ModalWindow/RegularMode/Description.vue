<template>
	<div>
		<div>
			<textarea
				style="outline: none; margin-bottom: 5px;"
				placeholder="Current description: empty"
				readonly="readonly"
				v-model="file.description"
			></textarea>
		</div>

		<div>
			<textarea
				style="margin-bottom: 5px;"
				placeholder="New description"
				v-model="newDescription"
			></textarea>
		</div>

		<div style="margin-top: 10px;">
			<input class="btn" type="button" value="Update" @click="updateDescription">
		</div>
	</div>
</template>

<style scoped>
.btn {
    height: 25px;
    font-size: 15px;
    width: 100px;
}

textarea {
    display: block;
    font-family: arial, sans-serif;
    font-size: 15px;
    height: 70px;
    margin: auto;
    resize: none;
    width: 400px;
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
    newDescription: string = "";

    created() {
        this.newDescription = this.file.description;
    }

    updateDescription() {
        API.files.changeDescription(this.file.id, this.newDescription);
        this.hideWindow();
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>

