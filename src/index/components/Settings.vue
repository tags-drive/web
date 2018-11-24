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
        // Copy global settings to local ones
        this.settings = JSON.parse(JSON.stringify(this.SharedState.state.settings));
    },
    destroyed: function() {
        // Update global settings from local ones
        this.SharedState.commit("changeSettings", this.settings);
    }
};
</script>
