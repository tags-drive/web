<template>
	<div
		class="file"
		@click="showPreview"
	>
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

    border-bottom: 1px solid #ddd;
    display: grid;
    grid-template-columns: 90px auto;
    grid-template-rows: $height;

    &:active {
        background-color: #dcdcdc70;
    }

    .preview {
        height: inherit;
        padding: 3px;

        img {
            display: block;
            height: inherit;
            margin: auto;
            max-height: 100%;
            max-width: 100%;
            width: auto;
        }
    }

    .filename {
        line-height: $height;

        // Hide extra characters
        -o-text-overflow: ellipsis;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components and classes
import { File } from "@app/global/classes";
// Other
import SharedStore from "@app/mobile/store";
import { Params } from "@app/global";
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/mobile/eventBus";

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
    },
    methods: {
        showPreview: function() {
            EventBus.$emit(Events.showPreview, { file: this.file });
        }
    }
});
</script>
