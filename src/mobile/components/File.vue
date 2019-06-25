<template>
	<div
		class="file"
		@click="showPreview"
	>
		<div class="preview">
			<span class="helper"></span>
			<loader :src="previewLink"></loader>
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
        padding: 5px;
        text-align: center;

        span.helper {
            display: inline-block;
            height: 100%;
            vertical-align: middle;
        }

        img {
            background-color: rgb(255, 255, 255);
            display: inline-block;
            height: auto;
            max-height: 100%;
            max-width: 100%;
            vertical-align: middle;
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
import LoaderComponent from "@app/global/components/Loader/Loader.vue";
// Other
import SharedStore from "@app/mobile/store";
import { Params } from "@app/global";
import { Const } from "@app/global/const";
import { Events, EventBus } from "@app/mobile/eventBus";
import { getShareTokenIfNeeded } from "@app/mobile/api";

export default Vue.extend({
    props: {
        file: File
    },
    data: function() {
        return {
            Store: SharedStore.state
        };
    },
    computed: {
        previewLink(): string {
            if (this.file.type.previewType === Const.previewTypes.image) {
                return Params.Host + "/" + this.file.preview + "?" + getShareTokenIfNeeded();
            }

            return Params.Host + "/ext/" + this.file.filename.split(".").pop();
        }
    },
    //
    components: {
        loader: LoaderComponent
    },
    //
    methods: {
        showPreview: function() {
            EventBus.$emit(Events.showPreview, { file: this.file });
        }
    }
});
</script>
