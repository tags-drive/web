<template>
	<div id="tags-drive">
		<div id="search-bar"></div>

		<div id="all-files-list"></div>

		<div id="files-preview"></div>
	</div>
</template>


<style lang="scss">
@import url("../global/styles.scss");
</style>


<script lang="ts">
import Vue from "vue";
//
import { API } from "@app/mobile/api";
import SharedStore from "@app/mobile/store";

export default Vue.extend({
    created: function() {
        API.tags.fetch();
        let counter = SharedStore.state.allTagsChangesCounter;

        let fetchFiles = () => {
            if (SharedStore.state.allTagsChangesCounter === counter) {
                setTimeout(fetchFiles, 50);
            } else {
                API.files.fetch("", "", false, "", "", 0, 25);
            }
        };

        setTimeout(fetchFiles, 50);
    }
});
</script>
