<template>
	<div>
		{{ file.filename }}
	</div>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { File } from "@app/global/classes";

export default Vue.extend({
    props: {
        file: File
    }
});
</script>

