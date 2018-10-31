<template>
<div>
	<div v-for="(tag, index) in tags" :key="index">
		<div style="display: flex; margin-right: auto; margin-left: auto; margin-bottom: 5px; position: relative;">
			<div style="width: 200px; display: flex">
				<div :style="{ 'background-color': tag.color }" class="tag" style="margin: 0;">
					<div>{{tag.name}}</div>
				</div>
			</div>
			<div style="position: absolute; right: 0;">
				<input
					type="checkbox"
					style="width: 20px; height: 20px; right: 0;"
					@click="labelTag(tag.id)"
					:title="mode == 'and' ? 'Add tag' : 'Delete tag'"
				>
			</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
    props: {
        mode: String, // "add" or "del"
        tags: Object
    },
    data: function() {
        return {
            selectedTags: []
        };
    },
    destroyed: function() {
        if (this.mode == "add") {
            this.$parent.filesAPI().tagSelectedFiles(this.selectedTags);
        } else {
            this.$parent.filesAPI().untagSelectedFiles(this.selectedTags);
        }
    },
    methods: {
        labelTag: function(id) {
            this.selectedTags.push(id);
        }
    }
};
</script>
