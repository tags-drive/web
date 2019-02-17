<template>
	<div>
		<h2>Settings</h2>

		<div id="settings">
			<!-- Show deleted files -->
			<div class="setting">
				<span>Show deleted files:</span>
				<input
					type="checkbox"
					class="vertically"
					v-model="settings.showDeletedFiles">
			</div>
		</div>

		<p></p>

		<span class="noselect">Tags Drive {{version}} (<a href="https://github.com/tags-drive">github.com/tags-drive</a>)</span>

		<p></p>

		<div>
			<input
				type="button"
				class="btn"
				style="width: 100px; height: 25px;"
				value="Save"
				@click="saveSettings">
		</div>
	</div>
</template>

<style scoped>
h2 {
    margin-top: 0;
}

#settings {
    display: inline-block;
    text-align: left;
    width: auto;
}

.setting {
    font-size: 18px;
    margin-bottom: 10px;
}

input {
    vertical-align: middle;
}

input[type="checkbox"] {
    transform: scale(1.4);
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Classes and types
import { Settings } from "@app/index/state/types";
// Shared data
import SharedState from "@app/index/state";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Version } from "@app/global";

@Component({})
export default class extends Vue {
    settings: Settings = { showDeletedFiles: false };
    version: string = Version;

    created() {
        this.$nextTick(function() {
            // Add onchange handlers to input["checkbox"]
            let elements = document.getElementById("settings")!.getElementsByTagName("input");
            for (let i = 0; i < elements.length; i++) {
                elements[i].onchange = () => this.apply();
            }
        });

        // Copy global settings to local ones
        this.settings = JSON.parse(JSON.stringify(SharedState.state.settings));
    }

    destroyed() {
        // If user pressed Save button, readSettings will read same settings,
        // else readSettings will recover saved settings
        SharedState.commit("readSettings");
    }

    apply() {
        SharedState.commit("applySettings", this.settings);
    }

    saveSettings() {
        // Update global settings from local ones
        // We will save current settings because we call apply() on every change
        SharedState.commit("saveSettings");

        // Close window
        EventBus.$emit(Events.ModalWindow.HideWindow);
    }
}
</script>
