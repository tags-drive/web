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

		<div>
			<input
				type="button"
				class="btn"
				style="width: 100px; height: 25px;"
				value="Save"
				@click="saveSettings">
		</div>

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

#info {
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

input {
    vertical-align: middle;
}

input[type="checkbox"] {
    transform: scale(1.4);
}
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { Settings } from "@app/index/state/types";
// Shared data
import SharedState from "@app/index/state";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Version, Params } from "@app/global";
import { IsErrorStatusCode } from "@app/global/utils";

export default Vue.extend({
    data: function() {
        return {
            settings: <Settings>{ showDeletedFiles: false },
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

        this.$nextTick(function() {
            // Add onchange handlers to input["checkbox"]
            let elements = document.getElementById("settings")!.getElementsByTagName("input");
            for (let i = 0; i < elements.length; i++) {
                elements[i].onchange = () => this.apply();
            }
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
