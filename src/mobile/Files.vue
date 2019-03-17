<template>
<div id="wrapper">
	<div id="all-files">
		<div
			v-for="(file, index) in allFiles"
			:key="index"
		>
			<file :file="file"></file>
		</div>
	</div>
</div>
</template>


<style lang="scss" scoped>
#wrapper {
    height: calc(100vh - 41px);
}

#all-files {
    overflow-y: auto;
    height: 100%;
    width: 100%;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import FileComponent from "@app/mobile/components/File.vue";
// Other
import { File } from "@app/global/classes";
import SharedStore from "@app/mobile/store";

export default Vue.extend({
    data: function() {
        return {
            Store: SharedStore.state
        };
    },
    components: { file: FileComponent },
    computed: {
        allFiles: function() {
            // reactive
            let reactive = this.Store.allFilesChangesCounter;
            return this.Store.allFiles;
        }
    }
});
</script>
