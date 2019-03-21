<template>
	<div
		v-show="show"
		id="files-preview"
		:class="previewClasses"
	>
		<div
			id="container"
			:class="containerClasses"
		>
			<preview-component
				v-for="(file, index) in files"
				:key="index"
				class="preview"
				:file="file"
			></preview-component>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#files-preview {
    position: fixed;
    background-color: white;
    top: 0;
    left: 0;
    transition: transform 0.25s ease-out, opacity 0.25s;
    width: 100%;
    height: 100%;
    z-index: 2;
}

.preview--animation-close {
    transform: translate(0, -100%) !important;
    opacity: 0;
}

#container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    transition: transform 0.25s ease;

    .preview {
        min-width: 100%;
        width: 100%;
        height: 100%;
    }
}

.container--idle {
    transition: none !important;
    transform: translate(-1 * 100%) !important;
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

const transformTransitionTime = 250; // ms

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
            yMouseStart: 0,
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
                        this.yMouseStart = ev.clientY;
                    } else {
                        let touch = ev.changedTouches.item(0);
                        if (touch === null) {
                            return;
                        }
                        this.xMouseStart = touch.clientX;
                        this.yMouseStart = touch.clientY;
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

                    let xMouseEnd = 0,
                        yMouseEnd = 0;

                    if (ev instanceof MouseEvent) {
                        xMouseEnd = ev.clientX;
                        yMouseEnd = ev.clientY;
                    } else {
                        let touch = ev.changedTouches.item(0);
                        if (touch === null) {
                            return;
                        }
                        xMouseEnd = touch.clientX;
                        yMouseEnd = touch.clientY;
                    }

                    let deltaX = xMouseEnd - this.xMouseStart,
                        deltaY = yMouseEnd - this.yMouseStart;

                    // Switch preview
                    if (this.previewWidth / 4 <= Math.abs(deltaX)) {
                        let func = () => {};

                        if (deltaX < 0 && this.currIndex < this.Store.allFiles.length - 1) {
                            // Next preview
                            func = () => {
                                this.shouldSwitchRight = true;
                                setTimeout(() => {
                                    this.shouldSwitchRight = false;
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
                                    this.previousPreview();
                                }, transformTransitionTime);
                            };
                        }

                        func();
                        return;
                    }

                    // Close preview
                    if (deltaY < 0 && this.previewHeight / 6 <= Math.abs(deltaY)) {
                        this.shouldClose = true;
                        setTimeout(() => {
                            this.shouldClose = false;
                            this.show = false;
                        }, transformTransitionTime);
                        return;
                    }
                }
            };
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
        }
    }
});
</script>
