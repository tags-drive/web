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
import TagComponent from "./Tag/Tag.vue";
import SharedStore from "@/index/store";

export default {
    props: {
        id: Number
    },
    data: function() {
        return {
            tag: Object
        };
    },
    created() {
        this.tag = SharedStore.state.allTags.get(this.id);
    },
    components: {
        tag: TagComponent
    },
    methods: {
        startDrag: function(ev) {
            ev.dataTransfer.setData("tagID", this.id);
        }
    }
};
</script>
