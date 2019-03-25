<template>
	<div
		id="search-bar"
		ref="search-bar"
	>
		<!-- Bar -->
		<div
			v-if="!opened"
			id="bar"
		>
			<div id="logo" class="noselect">Tags Drive</div>

			<div style="text-align: center;">TODO</div>

			<div
				id="expand-button"
				@click="expandBar"
			>
				<i class="material-icons noselect">expand_more</i>
			</div>
		</div>

		<!-- Expanded window -->
		<div
			v-if="opened"
			id="expanded-window"
		>
			<div
				id="close-button"
				@click="closeBar"
			>
				<i class="material-icons noselect">expand_less</i>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
$height: 40px;

#search-bar {
    background-color: white;
    border: 1px solid #0000002f;
    height: $height;
    left: 0;
    position: fixed;
    text-align: left;
    top: 0;
    transition: height 0.15s ease-out;
    width: 100%;
    z-index: 2;
}

.search-bar-expand-animation {
    height: 100% !important;
}

// Expand more/less buttons
@mixin button {
    $padding: 4px;

    border-radius: 3px;
    height: $height - $padding;
    width: $height - $padding; // it is a square by default
    text-align: center;

    &:active {
        background-color: #dcdcdc70;
    }

    i {
        font-size: $height - $padding;
    }
}

#bar {
    display: grid;
    grid-template-columns: 111px auto 40px;
    padding: 0 5px;

    #logo {
        cursor: default;
        font-family: none;
        font-size: 25px;
        height: $height;
        line-height: $height;
    }

    #expand-button {
        @include button();

        margin: auto;
    }
}

#expanded-window {
    #close-button {
        @include button();

        border: 1px solid #00000010;
        bottom: 5px;
        left: 50%;
        position: absolute;
        transform: translateX(-50%);
        width: 100px;
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Other
import SharedStore from "@app/mobile/store";

import { API } from "@app/mobile/api";
import { EventBus, Events } from "@app/mobile/eventBus";

const fetchLimit = 25;

export default Vue.extend({
    data: function() {
        return {
            expression: "",
            textToSearch: "",
            isRegexp: false,
            sortType: "",
            sortOrder: "",
            //
            opened: false
        };
    },
    //
    created: function() {
        EventBus.$on(Events.fetchNextFiles, () => {
            API.files.fetch(
                this.expression,
                this.textToSearch,
                this.isRegexp,
                this.sortType,
                this.sortOrder,
                SharedStore.state.allFiles.length,
                fetchLimit,
                false
            );
        });
    },
    //
    methods: {
        expandBar() {
            let bar = <HTMLAudioElement>this.$refs["search-bar"];
            if (bar !== undefined) {
                bar.classList.add("search-bar-expand-animation");
            }
            this.opened = true;
        },
        closeBar() {
            let bar = <HTMLAudioElement>this.$refs["search-bar"];
            if (bar !== undefined) {
                bar.classList.remove("search-bar-expand-animation");
            }
            this.opened = false;
        }
    }
});
</script>
