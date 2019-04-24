<template>
	<div style="width: 700px;">
		<!-- Existed tags -->
		<tag-editor
			v-for="(id, index) in allTagsIDs"
			:key="index"
			:tagID="id"
			:tag="Store.allTags.get(id)"
		></tag-editor>
		<p></p>

		<span style="font-size: 18px;">New tag creation</span>
		<p></p>

		<!-- New tag -->
		<tag-editor :is-new-tag="true"></tag-editor>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
// Components
import TagEditor from "./TagEditor.vue";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Params } from "@app/global";
import { logError, logInfo } from "@app/index/utils";
import API from "@app/index/api";

export default Vue.extend({
    data: function() {
        return {
            Store: SharedStore.state
        };
    },
    computed: {
        allTagsIDs: function() {
            // For reactive updating (see @app/index/store/types.ts for more information)
            return this.Store.allTagsChangesCounter && Array.from(this.Store.allTags.keys());
        }
    },
    //
    components: {
        "tag-editor": TagEditor
    },
    //
    created: function() {
        this.$on("add-tag", (payload: any) => {
            this.addTag(payload.name, payload.color, payload.group);
        });
        this.$on("change-tag", (payload: any) => {
            this.changeTag(payload.tagID, payload.newName, payload.newColor, payload.newGroup);
        });
        this.$on("delete-tag", (payload: any) => {
            this.deleteTag(payload.tagID);
        });
    },
    methods: {
        addTag: function(name: string, color: string, newGroup?: string) {
            API.tags.add(name, color, newGroup);
        },
        changeTag: function(tagID: number, newName: string, newColor: string, newGroup?: string) {
            API.tags.change(tagID, newName, newColor, newGroup);
        },
        deleteTag: function(tagID: number) {
            API.tags.delete(tagID);
        }
    }
});
</script>
