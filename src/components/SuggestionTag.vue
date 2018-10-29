<template>
	<div class="suggestion-tag" @click="add">
		<div :style="{ 'background-color': tag.color }" class="tag" style="margin: 0; cursor: pointer;" :title="'id - ' + tag.id">
			{{tag.name}}
		</div>
	</div>
</template>

<script>
export default {
    props: {
        tag: Object
    },
    methods: {
        add: function() {
            this.$parent.input().tags.add(this.tag.id);
        }
    }
};
</script>

<style>
.suggestion-tag {
    border-radius: 5px;
    cursor: pointer;
    padding: 4px;
}

.suggestion-tag:hover {
    background-color: var(--secondary-element-color);
}
</style>
