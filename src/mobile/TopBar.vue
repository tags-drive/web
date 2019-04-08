<template>
	<div
		id="top-bar"
		ref="top-bar"
	>
		<!-- Bar -->
		<div
			id="bar"
		>
			<div id="logo" class="noselect">Tags Drive</div>

			<div id="buttons">
				<div
					class="button"
					@click="toggleSearchBar"
				>
					<i class="material-icons noselect">search</i>
				</div>
			</div>
		</div>

		<!-- Expanded window -->
		<div
			v-show="opened"
			id="expanded-window"
		>
			<div v-show="searchMode">
				<search-window></search-window>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
$height: 40px;

#top-bar {
    background-color: white;
    height: $height;
    left: 0;
    position: fixed;
    text-align: left;
    top: 0;
    transition: height 0.15s ease-out;
    width: 100%;
    z-index: 2;
}

.top-bar-expand-animation {
    height: 100% !important;
}

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
    border: 1px solid #0000002f;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;

    #logo {
        cursor: default;
        font-family: none;
        font-size: 25px;
        height: $height;
        line-height: $height;
    }

    #buttons {
        display: flex;
        height: fit-content;
        margin: auto 0;

        .button {
            @include button();

            margin-left: 10px;
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import SearchWindow from "@app/mobile/components/SearchWindow.vue";

export default Vue.extend({
    data: function() {
        return {
            opened: false,
            //
            searchMode: false
        };
    },
    //
    created: function() {
        this.$on("close-bar", () => {
            this.closeBar();
        });
    },
    //
    components: {
        "search-window": SearchWindow
    },
    //
    methods: {
        toggleSearchBar: function() {
            if (!this.opened) {
                this.expandBar();
                this.searchMode = true;
            } else {
                this.closeBar();
                this.searchMode = false;
            }
        },
        // Internal functions
        expandBar: function() {
            let bar = <HTMLAudioElement>this.$refs["top-bar"];
            if (bar !== undefined) {
                bar.classList.add("top-bar-expand-animation");
            }
            this.opened = true;
        },
        closeBar: function() {
            let bar = <HTMLAudioElement>this.$refs["top-bar"];
            if (bar !== undefined) {
                bar.classList.remove("top-bar-expand-animation");
            }
            this.opened = false;
        }
    }
});
</script>
