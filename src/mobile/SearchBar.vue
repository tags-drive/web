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

export default Vue.extend({
    computed: {
        searchBarStyles: function() {
            return {};
        }
    }
});
</script>
