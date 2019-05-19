<template>
	<div id="logo" class="noselect">
		<img src="/static/icons/logo.svg" alt="Tags Drive" draggable="false">
	</div>
</template>

<style lang="scss" scoped>
#logo {
    margin: 30px auto 20px;
    width: fit-content;

    > img {
        pointer-events: none;
        width: 150px;
    }
}
</style>
