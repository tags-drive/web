<template>
	<div style="min-width: 900px;">
		<div id="top-bar"></div>

		<!-- We have to set height for correct scroll -->
		<div id="files-block-wrapper" style="height: 95vh; overflow: hidden; width: 100%;">
			<div id="files-block"></div>
		</div>

		<div id="upload-block"></div>

		<div id="context-menu"></div>

		<div id="modal-window"></div>

		<div id="log-window"></div>

		<div id="preview-window"></div>
	</div>
</template>

<style>
:root {
    --primary-color: white;
    --secondary-color: #f7f7f7;
    --primary-border-color: rgba(0, 0, 0, 0.3);
    --secondary-border-color: rgba(0, 0, 0, 0.1);
    --primary-element-color: rgba(0, 0, 0, 0.3);
    --secondary-element-color: rgba(0, 0, 0, 0.1);
}

body {
    margin: 0;
    overflow-y: hidden;
    padding: 0;
}

.vertically {
    margin-bottom: auto;
    margin-top: auto;
}

.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.material-icons {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    vertical-align: middle;
}

.file-info {
    height: 50px;
}

/* Files in table */
.file-info > td,
th {
    border-bottom: 1px solid #dddddd;
    border-collapse: collapse;
    font-family: arial, sans-serif;
    height: 40px;
    padding: 4px;
    text-align: left;
}

.btn {
    background-color: white;
    border: 1px solid var(--primary-border-color);
    border-radius: 2px;
    cursor: pointer;
}

.btn:hover {
    background-color: var(--secondary-element-color);
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Shared data
import SharedStore from "@app/index/store";
import SharedState from "@app/index/state";

@Component({})
export default class extends Vue {
    created() {
        SharedState.commit("readSettings");
        SharedStore.commit("updateTags");

        // If we call SharedStore.commit("updateFiles") immediately, some tags can be undefined.
        // So we need to wait for tags are ready
        let t = setInterval(() => {
            if (SharedStore.state.tagsReady) {
                SharedStore.commit("updateFiles");
                clearInterval(t);
            }
        }, 10);
    }
}
</script>
