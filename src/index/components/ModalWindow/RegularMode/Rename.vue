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
//
import { File } from "@/index/global";
//
import { Events, EventBus } from "@/index/eventBus";
// Utils
import { Params } from "@/global";
import { logError, isErrorStatusCode } from "@/index/tools";

@Component({})
export default class extends Vue {
    @Prop() file!: File;
    newFilename: string = "";

    created() {
        this.newFilename = this.file.filename;
    }

    rename() {
        let params = new URLSearchParams();
        params.append("file", this.file.filename);
        params.append("new-name", this.newFilename);

        fetch(Params.Host + "/api/files/name?" + params, {
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
        EventBus.$emit(Events.ModalWindow.HideWindow);;
    }
}
</script>
