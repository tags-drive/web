<template>
	<div
		id="search-bar"
		:style="searchBarStyles"
	>
		<span>Search Bar (TODO)</span>
	</div>
</template>


<style lang="scss">
#search-bar {
    border: 1px solid #0000002f;
    height: 40px;
    position: relative;
    text-align: center;
}
</style>


<script lang="ts">
import Vue from "vue";
// Other
import SharedStore from "@app/mobile/store";

import { API } from "@app/mobile/api";
import { EventBus, Events } from "@app/mobile/eventBus";

const fetchLimit = 25;

export default Vue.extend({
    data: function() {
        return {
            expression: "",
            textToSearch: "",
            isRegexp: false,
            sortType: "",
            sortOrder: ""
        };
    },
    computed: {
        searchBarStyles: function() {
            return {};
        }
    },
    //
    created: function() {
        EventBus.$on(Events.fetchNextFiles, () => {
            API.files.fetch(
                this.expression,
                this.textToSearch,
                this.isRegexp,
                this.sortType,
                this.sortOrder,
                SharedStore.state.allFiles.length,
                fetchLimit,
                false
            );
        });
    }
});
</script>
