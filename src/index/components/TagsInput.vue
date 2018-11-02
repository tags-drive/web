<template>
	<div
		class="tag vertically"
		style="margin-bottom: 5px; margin-top: 5px;"
		draggable="true"
		:style="{ 'background-color': tag.color }"
		@dragstart="startDrag"
	>
		<div>{{tag.name}}</div>
	</div>
</template>

<script>
export default {
    props: {
        tag: Object
    },
    methods: {
        startDrag: function(ev) {
            ev.dataTransfer.setData("tagID", this.tag.id);
        }
    }
};
</script>
