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
			<img :src="originLink">
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
    box-shadow: 0px 2px 20px 0px #888;
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
</style>


<script lang="ts">
import Vue from "vue";
// Classes and types
import { File } from "@app/global/classes";
// Other
import { Params } from "@app/global";
import { Const } from "@app/global/const";

export default Vue.extend({
    data: function() {
        return {
            showAsText: false,
            textFileContent: ""
        };
    },
    props: {
        file: File
    },
    computed: {
        originLink(): string {
            return Params.Host + "/" + this.file!.origin;
        }
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
                let audio = <HTMLAudioElement>this.$refs["audio-block"];
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
                let video = <HTMLVideoElement>this.$refs["video-block"];
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

