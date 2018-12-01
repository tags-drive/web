<template>
<div>
	<div v-for="(tag, index) in tags" :key="index">
		<div style="display: flex; margin-right: auto; margin-left: auto; margin-bottom: 5px; position: relative;">
			<div style="width: 200px; display: flex">
				<tag :tag="tag" style="margin: 0;"></tag>
			</div>
			<div style="position: absolute; right: 0;">
				<input
					type="checkbox"
					style="width: 20px; height: 20px; right: 0;"
					@click="labelTag(tag.id)"
				>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import TagComponent from "./Tag.vue";

export default {
    props: {
        tags: Object
    },
    data: function() {
        return {
            selectedTags: []
        };
    },
    components: {
        tag: TagComponent
    },
    methods: {
        labelTag: function(id) {
            this.selectedTags.push(id);
        }
    }
};
</script>
