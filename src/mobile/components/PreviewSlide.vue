<template>
<div>
	<!-- Preview -->
	<div id="preview-wrapper">
		<!-- Text -->
		<div
			v-if="isTextFile()"
			id="text-preview"
		>
			<pre>{{ textFileContent }}</pre>
		</div>
		<!-- Image -->
		<div
			v-else-if="isImage()"
			id="image-preview"
			class="noselect"
		>
			<loader :src="originLink"></loader>
		</div>
		<!-- Audio -->
		<div
			v-else-if="isAudio()"
			id="audio-preview"
		>
			<div>
				<audio controls style="width: 80%;" ref="audio-block">
					<source
						:src="originLink"
						:type="file.type.previewType">
					Your browser does not support the audio tag.
				</audio>
			</div>
		</div>
		<!-- Video -->
		<div
			v-else-if="isVideo()"
			id="video-preview"
		>
			<video
				width="100%" height="auto" controls
				ref="video-block"
			>
				<source
					:src="originLink"
					:type="file.type.previewType">
				Your browser does not support the video tag.
			</video> 
		</div>
		<!-- Unsupported format -->
		<div
			v-else
			id="unsupported-format"
		>
			<div>
				<span>File '{{ file.filename }}' can't be displayed</span>
			</div>
		</div>
	</div>

	<!-- Info -->

	<div class="info-card">
		<div class="header">Filename</div>
		<div class="info">{{ file.filename }}</div>
	</div>

	<div class="info-card">
		<div class="header">Tags</div>
		<div class="info">
			<div v-if="file.tags.length === 0">Empty</div>
			<div
				v-else
				id="tags"
				style="display: flex; flex-wrap: wrap;"
			>
				<tag
					v-for="(id, index) in file.tags"
					:key="index"
					:tag="Store.allTags.get(id)"
					style="margin-bottom: 3px;"
				></tag>
			</div>
		</div>
	</div>

	<div class="info-card">
		<div class="header">Description</div>
		<div class="info">{{ file.description ? file.description : "Empty" }}</div>
	</div>

	<div class="info-card">
		<div class="header">Size</div>
		<div class="info">{{ fileSize }}</div>
	</div>
</div>
</template>


<style lang="scss" scoped>
#preview-wrapper {
    height: fit-content;
    width: 100%;
}

// Previews

$max-preview-height: 70vh;

@mixin shadow-border {
    box-shadow: 0px 2px 10px 0px #888;
}

@mixin preview-block-common-styles {
    margin: 10px auto;
    width: 90%;
}

#text-preview {
    @include preview-block-common-styles();
    @include shadow-border();

    background-color: white;
    border-radius: 5px;
    overflow: auto;
    max-height: $max-preview-height;
    width: 80%;

    pre {
        margin: 0;
        padding: 10px;
    }
}

#image-preview {
    @include preview-block-common-styles();

    text-align: center;

    img {
        @include shadow-border();

        background-color: rgb(255, 255, 255);
        display: inline-block;
        height: auto;
        max-height: $max-preview-height;
        max-width: 100%;
        width: auto;
    }
}

#audio-preview {
    @include preview-block-common-styles();

    div {
        position: relative;
        height: 60px;

        audio {
            left: 50%;
            position: absolute;
            transform: translate(-50%);
        }
    }
}

#video-preview {
    @include preview-block-common-styles();

    video {
        @include shadow-border();

        max-height: $max-preview-height;
    }
}

#unsupported-format {
    @include preview-block-common-styles();
    @include shadow-border();

    background-color: white;
    border-radius: 5px;
    font-size: 25px;
    padding: 25px;
    text-align: center;
    width: 80%;

    div {
        word-wrap: break-word;
    }
}

// Info

.info-card {
    background-color: white;
    border: 1px solid #00000020;
    border-bottom: 1px solid #00000040;
    border-radius: 5px;
    box-sizing: border-box;
    height: auto;
    margin: auto;
    margin-bottom: 10px;
    padding: 5px;
    text-align: center;
    width: 90%;

    .header {
        border-bottom: 1px solid #00000020;
        font-size: 20px;
        margin: auto;
        margin-bottom: 10px;
        width: 95%;
    }

    .info {
        font-size: 16px;
        word-wrap: break-word;
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import Tag from "./Tag.vue";
import { File } from "@app/global/classes";
import LoaderComponent from "@app/global/components/Loader/Loader.vue";
// Other
import { Params } from "@app/global";
import { Const } from "@app/global/const";
import SharedStore from "@app/mobile/store";
import { getShareTokenIfNeeded } from "@app/mobile/api";

const sizeSuffixes: string[] = ["B", "KB", "MB", "GB", "TB"];

export default Vue.extend({
    props: {
        file: File
    },
    data: function() {
        return {
            showAsText: false,
            textFileContent: "",
            //
            Store: SharedStore.state
        };
    },
    computed: {
        originLink(): string {
            return Params.Host + "/" + this.file!.origin + "?" + getShareTokenIfNeeded();
        },
        fileSize(): string {
            let suffixIndex = 0;
            // In bytes
            let size = this.file.size;
            while (size / 1024 > 1) {
                size /= 1024;
                suffixIndex++;
            }

            if (suffixIndex >= sizeSuffixes.length) {
                return "-";
            }

            let s = size.toFixed(1);
            if (s[s.length - 1] == "0") {
                // Trim trailing dot and zero
                s = s.slice(0, s.length - 2);
            }

            return s + " " + sizeSuffixes[suffixIndex];
        }
    },
    //
    components: {
        tag: Tag,
        loader: LoaderComponent
    },
    //
    updated: function() {
        if (this.isTextFile()) {
            fetch(Params.Host + "/" + this.file!.origin, {
                method: "GET",
                credentials: "same-origin"
            })
                .then(resp => resp.text())
                .then(text => (this.textFileContent = text));
        }
    },
    //
    methods: {
        // Types
        isTextFile(): boolean {
            return this.file !== null && (this.file.type.previewType === Const.previewTypes.text || this.showAsText);
        },

        isImage(): boolean {
            return this.file !== null && this.file.type.previewType === Const.previewTypes.image;
        },

        isAudio(): boolean {
            let res = this.file !== null && this.file.type.previewType.includes(Const.previewTypes.audio);
            if (res) {
                let audio = this.$refs["audio-block"] as HTMLAudioElement;
                if (audio !== undefined) {
                    // We have to reload video with new src
                    this.$nextTick(() => {
                        audio.load();
                    });
                }
            }
            return res;
        },

        isVideo(): boolean {
            let res = this.file !== null && this.file.type.previewType.includes(Const.previewTypes.video);
            if (res) {
                let video = this.$refs["video-block"] as HTMLVideoElement;
                if (video !== undefined) {
                    // We have to reload video with new src
                    this.$nextTick(() => {
                        video.load();
                    });
                }
            }
            return res;
        }
    }
});
</script>

