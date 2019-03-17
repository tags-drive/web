<template>
	<div style="min-width: 900px;">
		<div id="top-bar"></div>

		<div id="files-block"></div>

		<div id="upload-block"></div>

		<div id="context-menu"></div>

		<div id="modal-window"></div>

		<div id="log-window"></div>

		<div id="preview-window"></div>
	</div>
</template>

<style lang="scss">
@import url("../global/styles.scss");
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";
import API from "@app/index/api";

@Component({})
export default class extends Vue {
    created() {
        SharedState.commit("readSettings");
        API.tags.fetch();

        // If we fetch files immediately, some tags can be undefined.
        // So we need to wait for tags are ready
        let t = setInterval(() => {
            if (SharedStore.state.tagsReady) {
                // fetch all files
                API.files.fetch("", "", false, "", "");
                clearInterval(t);
            }
        }, 10);
    }
}
</script>
