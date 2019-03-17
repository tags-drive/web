<template>
	<div class="file">
		<div class="preview">
			<img :src="previewLink" alt="">
		</div>

		<div class="filename">
			{{ file.filename }}
		</div>
	</div>
</template>


<style lang="scss" scoped>
.file {
    $height: 70px;

    display: grid;
    grid-template-columns: 90px auto;
    grid-template-rows: $height;
    border-bottom: 1px solid #ddd;

    .preview {
        height: inherit;
        padding: 3px;
        img {
            display: block;
            height: inherit;
            max-height: 100%;
            max-width: 100%;
            width: auto;
            margin: auto;
        }
    }

    .filename {
        line-height: $height;
    }
}
</style>


<script lang="ts">
import Vue from "vue";
import { File } from "@app/global/classes";
import SharedStore from "@app/mobile/store";
import { Params } from "@app/global";
import { Const } from "@app/global/const";

export default Vue.extend({
    data: function() {
        return {
            Store: SharedStore.state
        };
    },
    props: {
        file: File
    },
    computed: {
        previewLink(): string {
            if (this.file.type.previewType === Const.previewTypes.image) {
                return Params.Host + "/" + this.file.preview;
            }

            return Params.Host + "/ext/" + this.file.filename.split(".").pop();
        }
    }
});
</script>
