<template>
	<div id="settings-window">
		<h2>Settings</h2>

		<div id="settings">
			<!-- Show deleted files -->
			<div class="setting">
				<span class="title">Show deleted files:</span>
				<input
					type="checkbox"
					class="vertically"
					v-model="settings.showDeletedFiles"
					@change="apply">
			</div>

			<!-- View mode -->
			<div class="setting">
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
				style="width: 100px; height: 25px;"
				value="Save"
				@click="saveSettings">
		</div>

		<!-- Info -->
		<div id="info">
			<span class="noselect">Tags Drive – <a href="https://github.com/tags-drive" target="_blank">github.com/tags-drive</a></span>

			<div id="versions">
				<span class="noselect version">Frontend version - {{ frontendVersion }}</span>

				<div id="separator"></div>

				<span class="noselect version">Backend version - {{ backendVersion }}</span>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#settings-window {
    width: 600px;

    h2 {
        margin-top: 0;
    }

    > #settings {
        display: inline-block;
        text-align: left;
        width: auto;

        > .setting {
            font-size: 18px;
            margin-bottom: 10px;

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

    > #info {
        $height: 18px;

        font-size: 13px;
        margin: 30px auto 0;

        #versions {
            display: grid;
            grid-template-columns: 180px auto 180px;
            margin: 5px auto 0;
            text-align: center;
            width: 180px + 180px + 5px;

            .version {
                line-height: $height;
            }

            #separator {
                border-right: 1px solid #888888;
                height: $height;
                margin: auto;
                width: 1px;
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { Settings } from "@app/index/state/types";
// Shared data
import SharedState from "@app/index/state";
// Other
import { ViewModes } from "@app/index/state/types.ts";
import { Events, EventBus } from "@app/index/eventBus";
import { Version, Params } from "@app/global";
import { IsErrorStatusCode } from "@app/global/utils";

export default Vue.extend({
    data: function() {
        return {
            viewModesOptions: ViewModes,
            settings: <Settings>{ showDeletedFiles: false, viewMode: ViewModes.cards.value },
            frontendVersion: Version,
            backendVersion: "undefined"
        };
    },
    //
    created: function() {
        // Fetch backend version
        fetch(Params.Host + "/version", {
            method: "GET",
            credentials: "same-origin"
        }).then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                return;
            }
            resp.text().then(version => {
                this.backendVersion = version;
            });
        });

        // Copy global settings to local ones
        this.settings = JSON.parse(JSON.stringify(SharedState.state.settings));
    },
    destroyed: function() {
        // If user pressed Save button, readSettings will read same settings,
        // else readSettings will recover saved settings
        SharedState.commit("readSettings");
    },
    //
    methods: {
        apply: function() {
            SharedState.commit("applySettings", this.settings);
        },
        saveSettings: function() {
            // Update global settings from local ones
            // We will save current settings because we call apply() on every change
            SharedState.commit("saveSettings");

            // Close window
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
