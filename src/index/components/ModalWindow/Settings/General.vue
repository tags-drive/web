<template>
	<div id="general-settings">
		<div id="settings">
			<!-- Show deleted files -->
			<div class="setting noselect">
				<span class="title">Show deleted files:</span>
				<input
					type="checkbox"
					class="vertically"
					v-model="settings.showDeletedFiles"
					@change="apply">
			</div>

			<!-- View mode -->
			<div class="setting noselect">
				<span class="title">View mode:</span>

				<select
					class="vertically"
					v-model="settings.viewMode"
					@change="apply"
				>
					<option
						v-for="(opt, i) in viewModesOptions"
						:key=i
						:value="opt.value"
					>
						{{opt.text}}
					</option>
				</select>
			</div>
		</div>

		<!-- Save button -->
		<div id="save-button">
			<input
				type="button"
				class="btn"
				value="Save"
				@click="saveSettings">
		</div>
	</div>
</template>


<style lang="scss" scoped>
#general-settings {
    box-sizing: border-box;
    height: 100%;
    position: relative;
    width: 100%;

    > #settings {
        display: inline-block;
        height: 100%;
        text-align: left;
        width: 100%;

        > .setting {
            height: 23px;
            line-height: 23px;
            margin-bottom: 5px;
            width: fit-content;

            &::before {
                content: "• ";
            }

            > span.title {
                margin-right: 5px;
            }

            select {
                outline: none;
            }

            input {
                vertical-align: middle;
            }

            input[type="checkbox"] {
                transform: scale(1.4);
            }
        }
    }

    > #save-button {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);

        > input {
            height: 25px;
            outline: none;
            width: 100px;
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { Settings } from "@app/index/state/types";
// Shared data
import SharedState, { readSettings, applySettings } from "@app/index/state";
// Other
import { ViewModes } from "@app/index/state/types.ts";
import { Params } from "@app/global";

export default Vue.extend({
    data: function() {
        return {
            viewModesOptions: ViewModes,
            settings: { showDeletedFiles: false, viewMode: ViewModes.cards.value } as Settings
        };
    },
    //
    created: function() {
        // Copy global settings to local ones
        this.settings = JSON.parse(JSON.stringify(SharedState.state.settings));
    },
    destroyed: function() {
        // If user pressed Save button, readSettings will read same settings,
        // else readSettings will recover saved settings
        readSettings();
    },
    //
    methods: {
        apply() {
            applySettings(this.settings);
        },
        saveSettings() {
            // Update global settings from local ones
            // We will save current settings because we call apply() on every change
            SharedState.commit("saveSettings");
        }
    }
});
</script>
