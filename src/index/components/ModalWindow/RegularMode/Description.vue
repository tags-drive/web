<template>
	<div>
		<textarea
			style="outline: none; margin-bottom: 5px;"
			placeholder="Current description: empty"
			readonly="readonly"
			v-model="file.description"
		></textarea>

		<textarea
			style="margin-bottom: 5px;"
			placeholder="New description"
			v-model="newDescription"
		></textarea>

		<input class="btn" type="button" value="Update" @click="updateDescription">
	</div>
</template>

<style scoped>
textarea {
    display: block;
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
import { Params } from "@app/global";
import { logError, isErrorStatusCode } from "@app/index/tools";

@Component({})
export default class extends Vue {
    @Prop() file!: File;
    newDescription: string = "";

    created() {
        this.newDescription = this.file.description;
    }

    updateDescription() {
        let params = new URLSearchParams();
        let id = this.file.id;
        params.append("description", this.newDescription);

        fetch(Params.Host + `/api/file/${id}/description?` + params, {
            method: "PUT",
            credentials: "same-origin"
        })
            .then(resp => {
                if (isErrorStatusCode(resp.status)) {
                    resp.text().then(text => {
                        logError(text);
                    });
                    return;
                }
                // Refresh list of files
                EventBus.$emit(Events.Search.Usual);
                this.hideWindow();
            })
            .catch(err => {
                logError(err);
            });
    }

    hideWindow() {
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>

