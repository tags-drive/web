<template>
	<div>
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
			<audio controls style="width: 80%;" ref="audio-block">
				<source
					:src="originLink"
					:type="file.type.previewType">
				Your browser does not support the audio tag.
			</audio>
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
			<div style="padding: 15px 15px 0; word-wrap: break-word;">
				<span>File '{{ file.filename }}' can't be displayed</span>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
// Previews

@mixin preview-block-common-styles {
    height: 90%;
    margin: 10px auto;
    width: 90%;
}

#text-preview {
    @include preview-block-common-styles();

    background-color: white;
    border-radius: 5px;
    overflow: auto;
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
        background-color: rgb(255, 255, 255);
        display: inline-block;
        height: auto;
        max-height: 100%;
        max-width: 100%;
        width: auto;
    }
}

#audio-preview {
    @include preview-block-common-styles();

    position: relative;

    audio {
        height: 200px;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
    }
}

#video-preview {
    @include preview-block-common-styles();

    position: relative;

    video {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }
}

#unsupported-format {
    @include preview-block-common-styles();

    background-color: white;
    border-radius: 5px;
    font-size: 25px;
    text-align: center;
    width: 80%;
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
    created: function() {
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

