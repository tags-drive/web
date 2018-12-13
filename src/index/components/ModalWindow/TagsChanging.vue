<template>
	<div>
		<!-- Existed tags -->
		<modifying-tags
			v-for="(id, index) in allTagsIDs"
			:key="index"
			:tagID="id"
			:tag="Store.allTags.get(id)"
		></modifying-tags>
		<p></p>

		<input
			class="btn"
			style="width: 150px; height: 25px;"
			type="button"
			value="Create new tag">
		<p></p>

		<!-- New tag -->
		<modifying-tags :is-new-tag="true"></modifying-tags>
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

    get allTagsIDs() {
        // For reactive updating (see @/index/store/types.ts for more information)
        return SharedStore.state.allTagsChangesCounter && Array.from(SharedStore.state.allTags.keys());
    }

    created() {
        this.$on("add-tag", (payload: any) => {
            this.addTag(payload.name, payload.color);
        });
        this.$on("change-tag", (payload: any) => {
            this.changeTag(payload.tagID, payload.newName, payload.newColor);
        });
        this.$on("delete-tag", (payload: any) => {
            this.deleteTag(payload.tagID);
        });
    }

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
}
</script>
