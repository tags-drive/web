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
    display: flex;
    height: fit-content;
    line-height: 20px;
    margin-right: 5px;
    min-height: 20px;
    padding: 3px;
    padding-right: 5px;
	word-break: break-all;  /* For Firefox */
    word-break: break-word; /* For Chrome */
}

.color-circle {
    border: 0.5px solid #0000002f;
    border-radius: 8px;
    margin: auto 3px auto 0;
    min-height: 15px;
    min-width: 15px;
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

