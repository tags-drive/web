<template>
	<div
		id="log-window"
		v-if="show"
		:style="{'opacity': opacity}"
		@mouseenter="window().mouseEnter()"
		@mouseleave="window().mouseLeave()"
	>
		<div style="float: right;">
			<i
				class="material-icons btn noselect"
				@click="window().hide()"
			>close</i>
		</div>

		<div
			style="margin-bottom: 5px;"
			v-for="(event, index) in events"
			:key="index"
		>
			{{event.time}}
			<span v-if="event.type === errorType" style="color: red;">[Error] </span>
			<span v-else-if="event.type === infoType" style="color: blue;">[Info] </span>
			{{event.msg}}
		</div>
	</div>
</template>

<style scoped>
#log-window {
    background-color: var(--secondary-color);
    border: 1px var(--primary-border-color) solid;
    border-radius: 5px;
    bottom: 10px;
    height: 200px;
    left: 10px;
    z-index: 3;
    overflow: auto;
    padding: 10px;
    position: fixed;
    width: 350px;
    word-wrap: break-word;
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

