<template>
<div class="tag noselect">
	<div
		class="color-circle noselect"
		:style="{ 'background-color': tag.color }"
	></div>
	<div>
		<span>{{tag.name}}</span>
	</div>
</div>
</template>

<style scoped>
.tag {
    background-color: white;
    border: 1px solid #42404033;
    border-radius: 15px;
    cursor: default;
    height: 20px;
    line-height: 20px;
    margin-right: 5px;
    padding: 3px;
    padding-right: 5px;
    display: flex;
}

.color-circle {
    border: 0.5px solid #0000002f;
    border-radius: 8px;
    height: 15px;
    margin: auto 3px auto 0;
    width: 15px;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Classes and types
import { Tag } from "@app/index/global";

@Component({})
export default class extends Vue {
    @Prop() tag!: Tag;
}
</script>

