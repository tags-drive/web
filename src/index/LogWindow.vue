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
			<span v-if="event.type == Const.logType.error" style="color: red;">[Error] </span>
			<span v-else-if="event.type == Const.logType.info" style="color: blue;">[Info] </span>
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

<script>
import dateformat from "dateformat";
//
import { Events, EventBus } from "./eventBus";

const hideTimeout = 5 * 1000; // 5s in milliseconds
const msTimeout = 50; // 50ms is good enough. When 100, FPS is too low

export default {
    data: function() {
        return {
            // States
            show: false,
            isMouseInside: false, // if isMouseInside, hideAfter isn't changed
            hideAfter: 5 * 1000,
            // UI
            opacity: 1,
            lastScrollHeight: 0,
            // Data
            /* events - array of objects:
           {
             type: string,
             msg: string,
             time: string
           }
        */
            events: []
        };
    },
    mounted: function() {
        EventBus.$on(Events.LogEvent, payload => {
            if (payload.type == undefined || payload.msg == undefined) {
				/* eslint-disable no-console */
				console.error("Payload hasn't type or msg fields:", payload);
				/* eslint-enable no-console */
                return;
            }

            this.add(payload.type, payload.msg);
        });
    },
    created: function() {
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
    },
    methods: {
        // UI
        window: function() {
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
        },
        // Data
        add: function(type, msg) {
            let time = dateformat(new Date(), "HH:MM");
            let obj = { type: type, msg: msg, time: time };
            this.events.push(obj);

            // Remove old events
            while (this.events.length > 10) {
                this.events.splice(0, 1);
            }
            this.window().show();
            this.window().scrollToEnd();
        }
    }
};
</script>
