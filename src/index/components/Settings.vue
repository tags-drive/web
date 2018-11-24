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

input[type="checkbox"] {
    vertical-align: middle;
    transform: scale(1.4);
}
</style>

<script>
export default {
    data: function() {
        return {
            settings: {}
        };
    },
    created: function() {
        this.$nextTick(function() {
            // Add onchange handlers to input["checkbox"]
            let checkboxes = document.getElementById("settings").getElementsByTagName("input");
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].onchange = () => this.apply();
            }
        });

        // Copy global settings to local ones
        this.settings = JSON.parse(JSON.stringify(this.SharedState.state.settings));
    },
    destroyed: function() {
        // If user pressed Save button, readSettings will read same settings,
        // else readSettings will recover saved settings
        this.SharedState.commit("readSettings");
    },
    methods: {
        apply: function() {
            this.SharedState.commit("applySettings", this.settings);
        },
        saveSettings: function() {
            // Update global settings from local ones
            // We will save current settings because we call apply() on every change
            this.SharedState.commit("saveSettings");

            // Close window
            this.$parent.hideWindow();
        }
    }
};
</script>
