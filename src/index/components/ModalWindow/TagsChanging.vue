<template>
	<div>
		<!-- Existed tags -->
		<modifying-tags
			v-for="(id, index) in Array.from(Store.allTags.keys())"
			:key="index"
			:tag="Store.allTags.get(id)"
		></modifying-tags>
		<p></p>

		<input
			class="btn"
			style="width: 150px; height: 25px;"
			type="button"
			@click="newTag.name === undefined ? newTag = {'name': 'new tag', 'color': '#ffffff'} : {}"
			value="Create new tag">
		<p></p>

		<!-- New tag -->
		<modifying-tags
			v-if="newTag.name !== undefined"
			:tag="newTag"
			:is-new-tag="true"
		></modifying-tags>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import ModifyingTags from "@/index/components/ModalWindow/ModifyingTags.vue";
// Shared data
import SharedStore from "@/index/store";
import { Store } from "@/index/store/types";
//
import { Tag } from "@/index/global";
//
import { Events, EventBus } from "@/index/eventBus";
// Utils
import { Params } from "@/global";
import { logError, logInfo, isErrorStatusCode } from "@/index/tools";

@Component({
    components: {
        "modifying-tags": ModifyingTags
    }
})
export default class extends Vue {
    Store: Store = SharedStore.state;
    //
    newTag: Tag = new Tag("new tag", "#ffffff");

    addTag(name: string, color: string) {
        let params = new URLSearchParams();
        params.append("name", name);
        params.append("color", color);

        fetch(Params.Host + "/api/tags?" + params, {
            method: "POST",
            credentials: "same-origin"
        })
            .then(resp => {
                if (isErrorStatusCode(resp.status)) {
                    resp.text().then(text => {
                        logError(text);
                    });
                    return;
                }

                this.deleteNewTag();
                SharedStore.commit("updateTags");
            })
            .catch(err => {
                logError(err);
            });
    }

    changeTag(tagID: number, newName: string, newColor: string) {
        let params = new URLSearchParams();
        params.append("id", String(tagID));
        params.append("name", newName);
        params.append("color", newColor);

        fetch(Params.Host + "/api/tags?" + params, {
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

                SharedStore.commit("updateTags");
            })
            .catch(err => {
                logError(err);
            });
    }

    deleteTag(tagID: number) {
        let params = new URLSearchParams();
        params.append("id", String(tagID));

        fetch(Params.Host + "/api/tags?" + params, {
            method: "DELETE",
            credentials: "same-origin"
        })
            .then(resp => {
                if (isErrorStatusCode(resp.status)) {
                    resp.text().then(text => {
                        logError(text);
                    });
                    return;
                }

                SharedStore.commit("updateTags");
                // Need to update files to remove deleted tag
                EventBus.$emit(Events.Search.Usual);
            })
            .catch(err => {
                logError(err);
            });
    }

    deleteNewTag() {
        this.newTag = new Tag();
    }
}
</script>
