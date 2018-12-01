<template>
	<div
		class="tag noselect"
		:style="{ 'background-color': tag.color }"
	>
		<span>{{tag.name}}</span>
	</div>
</template>

<style scoped>
.tag {
    border: 1px rgba(66, 64, 64, 0.2) solid;
    border-radius: 7px;
    cursor: default;
    display: flex;
    height: 20px;
    line-height: 20px;
    margin-right: 5px;
    padding: 2px;
    vertical-align: middle;
}
</style>

<script>
export default {
    //
    // tag scheme:
    // {
    //   "name": name,
    //   "color": color,
    // }
    props: {
        tag: Object
    }
};
</script>

