<template>
	<div
		id="log-window"
		v-if="show"
		:style="{'opacity': opacity}"
		@mouseenter="window().mouseEnter()"
		@mouseleave="window().mouseLeave()"
	>
		<div id="close-button">
			<i
				class="material-icons btn noselect"
				@click="window().hide()"
			>keyboard_arrow_right</i>
		</div>

		<div id="events">
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

					<div class="message">
						{{event.msg}}
					</div>	
				</div>

			</div>
		</div>
	</div>
</template>

<style scoped>
#log-window {
    background-color: #f7f7f7;
    border: 1px solid #00000050;
    border-radius: 5px;
    bottom: 10px;
    height: 450px;
    padding: 10px;
    position: fixed;
    right: 25px;
    width: 30%;
    z-index: 3;
}

#close-button {
    left: 0;
    position: absolute;
    top: 50%;
	transform: translateY(-50%);
    width: 100%;
}

#close-button > i {
    border-radius: 0px 5px 5px 0px;
    border-left: none;
    height: 80px;
    width: 20px;
}

#events {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    height: 100%;
    margin-left: 15px;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 3px;
}

.event {
    background-color: white;
    border: 1px solid #00000012;
    border-bottom: 1px solid #00000060;
    border-radius: 3px;
    margin-bottom: 5px;
    padding-bottom: 3px;
    padding-top: 3px;
    position: relative;
}

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
    margin-left: 13px; /* 5 + 5 + 5 - 2*/
    width: calc(100% - 13px);
}

.message {
    color: #000000b0;
    font-size: 14px;
    margin-left: 2px;
    word-wrap: break-word;
}

/* Scrollbar */
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
import Component from "vue-class-component";
// Other
import dateformat from "dateformat";
import { Events, EventBus } from "@app/index/eventBus";
import { Const } from "@app/index/const";

interface logEvent {
    type: string;
    msg: string;
    time: string;
}

const hideTimeout = 5 * 1000; // 5s in milliseconds
const msTimeout = 50; // 50ms is good enough. When 100, FPS is too low

@Component({})
export default class extends Vue {
    errorType: string = Const.logType.error;
    infoType: string = Const.logType.info;
    // States
    show: boolean = false;
    isMouseInside: boolean = false; // if isMouseInside, hideAfter isn't changed
    hideAfter: number = hideTimeout;
    // UI
    opacity: number = 1;
    lastScrollHeight: number = 0;
    // Data
    /* events - array of objects:
	{
		type: string,
		msg: string,
		time: string
	}
	*/
    events: logEvent[] = [];

    mounted() {}

    created() {
        EventBus.$on(Events.LogEvent, (payload: any) => {
            if (payload.type === undefined || payload.msg === undefined) {
                /* eslint-disable no-console */
                console.error("Payload hasn't type or msg fields:", payload);
                /* eslint-enable no-console */
                return;
            }

            this.add(payload.type, payload.msg);
        });

        setInterval(() => {
            if (this.isMouseInside) {
                return;
            }
            if (this.hideAfter < 0) {
                this.show = false;
            }
            this.hideAfter -= msTimeout;
            if (this.hideAfter < 1000) {
                this.opacity = this.hideAfter / 1000;
            }
        }, msTimeout);
    }

    // UI
    window() {
        return {
            show: () => {
                this.opacity = 1;
                this.hideAfter = hideTimeout;
                this.show = true;
            },
            hide: () => {
                this.show = false;
                this.isMouseInside = false;
            },
            mouseEnter: () => {
                this.isMouseInside = true;
                this.window().show(); // update opacity and hideAfter
            },
            mouseLeave: () => {
                this.isMouseInside = false;
            },
            scrollToEnd: () => {
                this.$el.scrollTop = this.$el.scrollHeight;
            }
        };
    }

    // Data
    add(type: string, msg: string) {
        let time = dateformat(new Date(), "HH:MM:ss");
        let obj: logEvent = { type: type, msg: msg, time: time };
        this.events.push(obj);

        // Remove old events
        while (this.events.length > 10) {
            this.events.splice(0, 1);
        }
        this.window().show();
        this.window().scrollToEnd();
    }
}
</script>

