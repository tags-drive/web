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
// Classes and types
import { File } from "@app/global/classes";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import API from "@app/index/api";

export default Vue.extend({
    props: {
        file: File
    },
    data: function() {
        return {
            newFilename: ""
        };
    },
    //
    created: function() {
        this.newFilename = this.file.filename;
    },
    //
    methods: {
        rename: function() {
            API.files.changeName(this.file.id, this.newFilename);
            this.hideWindow();
        },
        hideWindow: function() {
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
