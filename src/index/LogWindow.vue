<template>
	<div
		id="log-window"
		:style="logWindowStyles"
		@mouseenter="window().mouseEnter()"
		@mouseleave="window().mouseLeave()"
	>
		<div
			v-show="!show"
			id="open-button"
		>
			<i
				id="show-window-button"
				class="material-icons btn noselect"
				@click="window().show()"
			>keyboard_arrow_left</i>
		</div>

		<div id="close-button">
			<i
				class="material-icons btn noselect"
				@click="window().hide()"
			>keyboard_arrow_right</i>
		</div>

		<div
			id="events"
			ref="events"
		>
			<div
				class="event"
				v-for="(event, index) in events"
				:key="index"
			>
				<div
					class="indicator"
					:style="[event.type === errorType ? {'background-color': '#d32f2f'} : {'background-color': '#1976d2'}]"
				></div>

				<div class="message-block">
					<div style="font-size: 16px;">{{event.time}}</div>

					<div v-if="event.escape" class="message">{{ event.msg }}</div>
					<div v-else class="message" v-html="event.msg"></div>
				</div>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#log-window {
    background-color: #f7f7f7;
    border: 1px solid #b2b2b2;
    border-radius: 5px;
    bottom: 10px;
    height: 450px;
    max-width: 350px;
    min-width: 250px;
    padding: 10px;
    position: fixed;
    right: 25px;
    width: 30%;
    z-index: 3;
}

#open-button {
    left: 0;
    opacity: 0.3;
    position: absolute;
    top: 50%;
    transform: translate(-100%, -50%);

    &:hover {
        opacity: 1;
    }

    i {
        border-radius: 5px 0px 0px 5px;
        border-right: none;
        height: 80px;
        width: 20px;
    }
}

#close-button {
    left: 1px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;

    i {
        border-radius: 0px 5px 5px 0px;
        border-left: none;
        height: 80px;
        width: 20px;
    }
}

#events {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    height: 100%;
    margin-left: 15px;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 3px;

    .event {
        background-color: white;
        border: 1px solid #00000012;
        border-bottom: 1px solid #00000060;
        border-radius: 3px;
        margin-bottom: 5px;
        padding-bottom: 3px;
        padding-top: 3px;
        position: relative;

        .indicator {
            border-radius: 30px;
            height: 90%;
            margin-left: 5px;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 5px;
        }

        .message-block {
            margin-left: 13px; // 5 + 5 + 5 - 2
            width: calc(100% - 13px);
        }

        .message {
            color: #000000b0;
            font-size: 14px;
            margin-left: 2px;
            word-wrap: break-word;
        }
    }
}

// Scrollbar (Chrome)
::-webkit-scrollbar {
    width: 5px;
}

::-webkit-scrollbar-track {
    background: inherit;
}

::-webkit-scrollbar-thumb {
    border-radius: 5px;
}
</style>


<script lang="ts">
import Vue from "vue";
// Shared data
import SharedState from "@app/index/state";
// Other
import dateformat from "dateformat";
import { Events, EventBus } from "@app/index/eventBus";
import { Const } from "@app/global/const";

interface logEvent {
    type: string;
    msg: string;
    time: string;
    escape: boolean;
}

const hideTimeout = 5 * 1000; // 5s
const animationStart = 500; // 500ms
const msTimeout = 20; // 20ms is good enough
const maxEventsNumber = 1000;

export default Vue.extend({
    data: function() {
        return {
            errorType: Const.logType.error,
            infoType: Const.logType.info,
            // States
            show: false,
            isMouseInside: false, // if isMouseInside, hideAfter isn't changed
            hideAfter: 0,
            // Data
            events: [] as Array<logEvent>
        };
    },
    computed: {
        logWindowStyles: function(): any {
            let styles = {};

            // Blur
            if (SharedState.state.showPreviewWindow) {
                styles["filter"] = "blur(3px)";
            }

            if (this.show && (this.isMouseInside || this.hideAfter > 1000)) {
                return styles;
            }

            // Animation
            if (0 <= this.hideAfter && this.hideAfter <= animationStart) {
                let transform = 100 - Math.ceil((this.hideAfter / animationStart) * 100);

                if (transform !== 0) {
                    styles["right"] = "0";
                }
                styles["transform"] = `translateX(${transform}%)`;
            }

            return styles;
        }
    },
    //
    created: function() {
        EventBus.$on(Events.LogEvent, (payload: any) => {
            if (payload.type === undefined || payload.msg === undefined || payload.escape === undefined) {
                /* eslint-disable no-console */
                console.error("Payload hasn't type or msg fields:", payload);
                /* eslint-enable no-console */
                return;
            }

            let event: logEvent = {
                type: payload.type,
                msg: payload.msg,
                time: dateformat(new Date(), "HH:MM:ss"),
                escape: payload.escape
            };

            this.add(event);
        });

        setInterval(() => {
            if (this.isMouseInside) {
                return;
            }

            if (this.hideAfter <= 0) {
                this.show = false;
                return;
            }

            this.hideAfter -= msTimeout;
        }, msTimeout);
    },
    methods: {
        // UI
        window() {
            return {
                show: () => {
                    this.hideAfter = hideTimeout;
                    this.show = true;
                },
                hide: () => {
                    this.hideAfter = animationStart;
                    this.isMouseInside = false;
                },
                mouseEnter: () => {
                    // Don't interrupt animation
                    if (this.hideAfter > animationStart) {
                        this.hideAfter = hideTimeout;
                        this.isMouseInside = true;
                    }
                },
                mouseLeave: () => {
                    this.isMouseInside = false;
                },
                scrollToEnd: () => {
                    let elem = this.$refs["events"] as HTMLElement;
                    if (elem === undefined) {
                        return;
                    }

                    // We have to wait for render of a new element
                    setTimeout(() => {
                        elem.scrollTop = elem.scrollHeight;
                    }, 20);
                }
            };
        },
        // Data
        add(ev: logEvent) {
            this.events.push(ev);

            // Remove old events
            while (this.events.length > maxEventsNumber) {
                this.events.splice(0, 1);
            }

            this.window().show();
            this.window().scrollToEnd();
        }
    }
});
</script>
