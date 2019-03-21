<template>
	<div
		v-show="show"
		id="files-preview"
		:class="previewClasses"
	>
		<div id="buttons-bar">
			<div
				id="fullscreen-button"
				@click="turnOnFullscreen"
			>
				<i
					class="material-icons noselect"
					title="Turn on fullscreen mode"	
				>fullscreen</i>
			</div>

			<div
				id="close-button"
				@click="closePreview"
			>
				<i
					class="material-icons noselect"
					title="Close"
				>close</i>
			</div>
		</div>

		<div
			v-if="files.length === 3"
			id="container"
			:class="containerClasses"
		>
			<preview-component
				class="preview"
				:file="files[0]"
			></preview-component>
			
			<preview-component
				class="preview"
				ref="current-preview"
				:file="files[1]"
			></preview-component>

			<preview-component
				class="preview"
				:file="files[2]"
			></preview-component>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#files-preview {
    background-color: white;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    transition: transform 0.25s ease-out, opacity 0.25s;
    width: 100%;
    z-index: 2;
}

.preview--animation-close {
    opacity: 0;
    transform: translate(0, -100%) !important;
}

$buttons-bar-height: 35px;

#buttons-bar {
    display: flex;
    justify-content: space-between;
    height: $buttons-bar-height;
    margin: 5px auto 0;
    width: 95%;

    @mixin common-styles {
        border-radius: 3px;

        &:active {
            background-color: #ebebeb;
        }

        i {
            font-size: 35px;
        }
    }

    #fullscreen-button,
    #close-button {
        @include common-styles();
    }
}

#container {
    align-items: center;
    display: flex;
    height: calc(100% - #{$buttons-bar-height});
    transition: transform 0.25s ease;
    width: 100%;

    .preview {
        box-sizing: border-box;
        height: 100%;
        min-width: 100%;
        overflow-y: auto;
        padding-bottom: 30px;
        width: 100%;
    }
}

.container--idle {
    transform: translate(-1 * 100%) !important;
    transition: none !important;
}

.container--animation-switch-right {
    transform: translate(-2 * 100%) !important;
}

.container--animation-switch-left {
    transform: translate(0) !important;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components and classes
import PreviewComponent from "@app/mobile/components/PreviewSlide.vue";
import { File } from "@app/global/classes";
// Other
import { Events, EventBus } from "@app/mobile/eventBus";
import SharedStore from "@app/mobile/store";

// transition time is 250ms. We multiply it by 2/3 to improve preview scrolling
const transformTransitionTime = (2 / 3) * 250; // ms

export default Vue.extend({
    components: {
        "preview-component": PreviewComponent
    },
    //
    data: function() {
        return {
            // current file
            files: <File[]>[],
            currIndex: 0,
            // states
            show: false,
            shouldSwitchRight: false,
            shouldSwitchLeft: false,
            shouldClose: false,
            //
            xMouseStart: 0,
            // Preview takes up full screen
            previewHeight: window.innerHeight,
            previewWidth: window.innerWidth,
            //
            Store: SharedStore.state
        };
    },
    computed: {
        previewClasses: function() {
            return {
                "preview--animation-close": this.shouldClose
            };
        },
        containerClasses: function() {
            return {
                "container--idle": !this.shouldSwitchRight && !this.shouldSwitchLeft,
                "container--animation-switch-right": this.shouldSwitchRight,
                "container--animation-switch-left": this.shouldSwitchLeft
            };
        }
    },
    //
    created: function() {
        window.addEventListener("resize", () => {
            this.previewHeight = window.innerHeight;
            this.previewWidth = window.innerWidth;
        });

        EventBus.$on(Events.showPreview, (payload: any) => {
            if (payload === undefined || !(payload.file instanceof File)) {
                return;
            }

            this.files = [];
            this.files.push(new File());
            this.files.push(new File());
            this.files.push(new File());

            this.files[1] = payload.file;

            let allFiles = this.Store.allFiles;

            for (let i = 0; i < allFiles.length; i++) {
                if (allFiles[i].id == this.files[1].id) {
                    this.currIndex = i;
                    break;
                }
            }

            if (this.currIndex > 0) {
                this.files[0] = allFiles[this.currIndex - 1];
            }

            if (this.currIndex < allFiles.length - 1) {
                this.files[2] = allFiles[this.currIndex + 1];
            }

            this.show = true;
        });

        this.$nextTick(() => {
            let container = document.getElementById("files-preview");
            if (container === null) {
                return;
            }

            container.addEventListener("mousedown", this.listeners().lock);
            container.addEventListener("touchstart", this.listeners().lock);

            container.addEventListener("mouseup", this.listeners().free);
            container.addEventListener("touchend", this.listeners().free);
        });
    },
    //
    methods: {
        listeners() {
            const idsToSkip = ["text-preview", "audio-preview", "video-preview"];
            const tagsToSkip = ["PRE"];

            let shouldHandle = (ev: MouseEvent | TouchEvent): boolean => {
                if (!ev.cancelable || ev.target === null) {
                    return false;
                }

                let element = <HTMLElement>ev.target;
                if (tagsToSkip.includes(element.tagName) || idsToSkip.includes(element.id)) {
                    return false;
                }

                return true;
            };

            return {
                lock: (ev: MouseEvent | TouchEvent) => {
                    if (!shouldHandle(ev)) {
                        return;
                    }

                    if (ev instanceof MouseEvent) {
                        this.xMouseStart = ev.clientX;
                    } else {
                        let touch = ev.changedTouches.item(0);
                        if (touch === null) {
                            return;
                        }
                        this.xMouseStart = touch.clientX;
                    }
                },
                free: (ev: MouseEvent | TouchEvent) => {
                    if (!shouldHandle(ev)) {
                        return;
                    }

                    if (this.shouldSwitchRight || this.shouldSwitchLeft) {
                        // Don't interrupt current animation
                        return;
                    }

                    let xMouseEnd = 0;

                    if (ev instanceof MouseEvent) {
                        xMouseEnd = ev.clientX;
                    } else {
                        let touch = ev.changedTouches.item(0);
                        if (touch === null) {
                            return;
                        }
                        xMouseEnd = touch.clientX;
                    }

                    let deltaX = xMouseEnd - this.xMouseStart;

                    // Switch preview
                    if (this.previewWidth / 4 <= Math.abs(deltaX)) {
                        let func = () => {};

                        if (deltaX < 0 && this.currIndex < this.Store.allFiles.length - 1) {
                            // Next preview
                            func = () => {
                                this.shouldSwitchRight = true;

                                setTimeout(() => {
                                    this.shouldSwitchRight = false;
                                    this.scrollPreviewToTop();
                                    this.nextPreview();
                                }, transformTransitionTime);
                            };
                        }

                        if (deltaX > 0 && this.currIndex > 0) {
                            // Previous preview
                            func = () => {
                                this.shouldSwitchLeft = true;

                                setTimeout(() => {
                                    this.shouldSwitchLeft = false;
                                    this.scrollPreviewToTop();
                                    this.previousPreview();
                                }, transformTransitionTime);
                            };
                        }

                        func();
                        return;
                    }
                }
            };
        },
        //
        closePreview() {
            this.shouldClose = true;

            setTimeout(() => {
                this.shouldClose = false;
                this.show = false;
                this.scrollPreviewToTop();
            }, transformTransitionTime);
        },
        nextPreview() {
            // The function is called only when there's a next preview
            this.currIndex++;

            this.files[0] = this.files[1];
            this.files[1] = this.files[2];

            if (this.currIndex < this.Store.allFiles.length - 1) {
                this.files[2] = this.Store.allFiles[this.currIndex + 1];
            }
        },
        previousPreview() {
            // The function is called only when there's a previous preview
            this.currIndex--;

            this.files[2] = this.files[1];
            this.files[1] = this.files[0];

            if (this.currIndex - 1 >= 0) {
                this.files[0] = this.Store.allFiles[this.currIndex - 1];
            }
        },
        scrollPreviewToTop() {
            let preview = <Vue>this.$refs["current-preview"];
            if (preview === undefined) {
                return;
            }
            preview.$el.scrollTo(0, 0);
        },
        //
        turnOnFullscreen() {
            console.log("fullscreen");
        }
    }
});
</script>
