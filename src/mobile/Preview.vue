<template>
	<div
		v-show="show"
		id="files-preview"
		:style="previewStyle"
	>
		<div
			id="container"
			:style="containerStyle"
		>
			<div
				id="previous-preview"
				class="preview"
			>
				{{ previousFile.filename }}
			</div>

			<div
				id="current-preview"
				class="preview"
			>
				{{ file.filename }}
			</div>

			<div
				id="next-preview"
				class="preview"
			>
				{{ nextFile.filename }}
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#files-preview {
    position: fixed;
    background-color: #ddd;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
}

#container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    transform: translate(calc(-1 * 100%));

    .preview {
        border: 1px solid red;
        min-width: 100%;
        width: 100%;
        height: 150px;
        pointer-events: none;
    }
}
</style>

<script lang="ts">
import Vue from "vue";
// Components and classes
import { File } from "@app/global/classes";
// Other
import { Events, EventBus } from "@app/mobile/eventBus";
import SharedStore from "@app/mobile/store";

// Swipe buffers prevent instant start of swipe
const swipeBufferX = 75,
    swipeBufferY = 120;

export default Vue.extend({
    data: function() {
        return {
            // current file
            file: new File(),
            currIndex: 0,
            //
            nextFile: new File(),
            previousFile: new File(),
            // state
            show: false,
            xMouseStart: 0,
            yMouseStart: 0,
            deltaX: 0,
            deltaY: 0,
            //
            Store: SharedStore.state
        };
    },
    computed: {
        previewStyle: function() {
            // translate Y
            let transform = "translate(0, 0)",
                opacity = 1;
            if (this.deltaY < -swipeBufferY) {
                transform = `translate(0, ${this.deltaY + swipeBufferY}px)`;
                opacity = 1 + (this.deltaY + swipeBufferY) / this.previewHeight;
            }

            return {
                transform: transform,
                opacity: opacity
            };
        },
        containerStyle: function() {
            // translate X
            let transform = "translate(-100%)";
            if (Math.abs(this.deltaX) > swipeBufferX) {
                if (this.deltaX > 0) {
                    transform = `translate(calc(-100% + ${this.deltaX - swipeBufferX}px))`;
                } else {
                    transform = `translate(calc(-100% + ${this.deltaX + swipeBufferX}px))`;
                }
            }

            return {
                transform: transform
            };
        },
        //
        previewWidth: function() {
            let container = document.getElementById("files-preview");
            if (container === null) {
                return 0;
            }

            return container.clientWidth;
        },
        previewHeight: function() {
            let container = document.getElementById("files-preview");
            if (container === null) {
                return 0;
            }

            return container.clientHeight;
        }
    },
    //
    created: function() {
        EventBus.$on(Events.showPreview, (payload: any) => {
            if (payload === undefined || !(payload.file instanceof File)) {
                return;
            }

            this.file = payload.file;

            let allFiles = this.Store.allFiles;

            for (let i = 0; i < allFiles.length; i++) {
                if (allFiles[i].id == this.file.id) {
                    this.currIndex = i;
                    break;
                }
            }

            if (this.currIndex > 0) {
                this.previousFile = allFiles[this.currIndex - 1];
            }

            if (this.currIndex < allFiles.length) {
                this.nextFile = allFiles[this.currIndex + 1];
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

            container.addEventListener("touchmove", this.listeners().move);
            container.addEventListener("mousemove", this.listeners().move);

            container.addEventListener("mouseup", this.listeners().free);
            container.addEventListener("touchend", this.listeners().free);
        });
    },
    //
    methods: {
        listeners() {
            return {
                lock: (ev: MouseEvent | TouchEvent) => {
                    ev.preventDefault();

                    let x = 0,
                        y = 0;

                    if (ev instanceof MouseEvent) {
                        x = ev.clientX;
                        y = ev.clientY;
                    } else if (ev instanceof TouchEvent) {
                        let touch = ev.changedTouches.item(0);
                        if (touch === null) {
                            return;
                        }
                        x = touch.clientX;
                        y = touch.clientY;
                    }

                    this.xMouseStart = x;
                    this.yMouseStart = y;
                },
                move: (ev: MouseEvent | TouchEvent) => {
                    ev.preventDefault();

                    let x = 0,
                        y = 0;

                    if (ev instanceof MouseEvent) {
                        x = ev.clientX;
                        y = ev.clientY;
                    } else if (ev instanceof TouchEvent) {
                        let touch = ev.changedTouches.item(0);
                        if (touch === null) {
                            return;
                        }
                        x = touch.clientX;
                        y = touch.clientY;
                    }

                    this.deltaX = x - this.xMouseStart;
                    this.deltaY = y - this.yMouseStart;
                },
                free: (ev: MouseEvent | TouchEvent) => {
                    ev.preventDefault();

                    if (this.previewWidth / 5 <= Math.abs(this.deltaX) - swipeBufferX) {
                        // Should switch
                        if (this.deltaX > 0) {
                            this.previousPreview();
                        } else {
                            this.nextPreview();
                        }
                    } else if (this.deltaY < 0 && this.previewHeight / 5 <= Math.abs(this.deltaY) - swipeBufferY) {
                        // Should close
                        this.show = false;
                    }

                    this.deltaX = 0;
                    this.deltaY = 0;
                }
            };
        },
        nextPreview() {
            alert("next");
        },
        previousPreview() {
            alert("prev");
        }
    }
});
</script>
