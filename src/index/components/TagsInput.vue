<template>
	<div
		class="vertically"
		style="background-color: #ffffff00; margin-right: 5px;"
		draggable="true"
		@dragstart="startDrag"
	>
		<tag
			:tag="tag"
			style="margin: 0;"
		></tag>
	</div>
</template>

<script>
import TagComponent from "./Tag.vue";

export default {
    props: {
        tag: Object
    },
    components: {
        tag: TagComponent
    },
    methods: {
        startDrag: function(ev) {
            ev.dataTransfer.setData("tagID", this.tag.id);
        }
    }
};
</script>
