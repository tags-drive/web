<template>
	<div
		class="tag"
		:style="{ 'background-color': tag.color }"
		@mouseenter="show = true;"
		@mouseleave="show = false;"
	>
		<div>{{tag.name}}</div>
		<i
			class="material-icons noselect"
			style="cursor: pointer; font-size: 20px;"
			v-show="show"
			@click="deleteTagFromSearch();"
		>close</i>
	</div>
</template>

<script>
export default {
    name: "search-tag",
    props: {
        tag: Object
    },
    data: function() {
        return {
            show: false
        };
    },
    methods: {
        deleteTagFromSearch: function() {
            this.$parent.input().tags.delete(this.tag.id);
        }
    }
};
</script>
