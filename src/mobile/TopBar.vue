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
					@click="logout"
				>
					<i class="material-icons noselect">exit_to_app</i>
				</div>

				<div
					class="button"
					@click="toggleUploadBar"
				>
					<svg viewBox="0 0 24 24">
						<path fill="#000000" d="M9,10V16H15V10H19L12,3L5,10H9M12,5.8L14.2,8H13V14H11V8H9.8L12,5.8M19,18H5V20H19V18Z" />
					</svg>
				</div>

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
			<div v-show="uploadMode">
				<upload-window></upload-window>
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
    $size: 35px;

    border-radius: 3px;
    height: $size;
    width: $size; // it is a square by default
    text-align: center;

    &:active {
        background-color: #dcdcdc70;
    }

    i {
        font-size: $size;
    }

    svg {
        height: $size;
        width: $size;
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
import UploadWindow from "@app/mobile/components/UploadWindow.vue";
// Other
import { API } from "@app/mobile/api";

export default Vue.extend({
    data: function() {
        return {
            opened: false,
            //
            searchMode: false,
            uploadMode: false
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
        "search-window": SearchWindow,
        "upload-window": UploadWindow
    },
    //
    methods: {
        logout: function() {
            if (confirm("Are you sure you want to log out?")) {
                API.logout();
            }
        },
        //
        toggleSearchBar: function() {
            if (!this.opened) {
                this.expandBar();
                this.searchMode = true;
            } else {
                this.closeBar();
                this.searchMode = false;
            }
        },
        toggleUploadBar: function() {
            if (!this.opened) {
                this.expandBar();
                this.uploadMode = true;
            } else {
                this.closeBar();
                this.uploadMode = false;
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
