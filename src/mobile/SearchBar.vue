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

			<div>
				<div
					id="search-button"
					@click="search"
				>
					<i class="material-icons noselect">search</i>
				</div>
			</div>

			<div
				id="expand-button"
				@click="expandBar"
			>
				<i class="material-icons noselect">expand_more</i>
			</div>
		</div>

		<!-- Expanded window -->
		<div
			v-show="opened"
			id="expanded-window"
		>
			<!-- Logical expression -->
			<div id="search-input">
				<!-- Input -->
				<div
					v-show="focused || expression === ''"
					id="input-wrapper"
					@click="focused = true"
				>
					<input
						id="expression-input"
						type="text"
						placeholder="Enter logical expression"
						ref="expression-input"
						v-model="expression">
				</div>

				<!-- Render -->
				<div
					v-show="!(focused || expression === '')"
					id="render-wrapper"
					@click="focusInput"
				>
					<render-tags-input
						:expression="expression"
					></render-tags-input>
				</div>
			</div>

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
    padding: 0 10px;

    #logo {
        cursor: default;
        font-family: none;
        font-size: 25px;
        height: $height;
        line-height: $height;
    }

    div {
        position: relative;

        #search-button {
            @include button();

            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
        }
    }

    #expand-button {
        @include button();

        margin: auto;
    }
}

#expanded-window {
    padding: 5px;

    #search-input {
        $min-height: 40px;

        border-bottom: 1px solid #888888;
        height: fit-content;
        position: relative;
        margin: auto 0 10px;
        width: 100%;

        @mixin wrapper {
            box-sizing: border-box;
            cursor: text;
            min-height: $min-height;
            width: 100%;
        }

        #input-wrapper {
            @include wrapper();

            #expression-input {
                border: none;
                box-sizing: border-box;
                font-size: 16px;
                height: $min-height;
                outline: none;
                width: inherit;
            }
        }

        #render-wrapper {
            @include wrapper();

            min-height: $min-height;
        }
    }

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
// Components and classes
import RenderTagsInput from "@app/mobile/components/RenderTagsInput.vue";
// Other
import SharedStore from "@app/mobile/store";
import { API } from "@app/mobile/api";
import { EventBus, Events } from "@app/mobile/eventBus";

function isElementInPath(event: Event, ...ids: string[]): boolean {
    // We need to use type any because Event hasn't property path, composedPath and composedPath().
    // Nevertheless, it's a cross browser way to get path.
    let path = (<any>event).path || ((<any>event).composedPath && (<any>event).composedPath());
    if (path === undefined || path.length === undefined) {
        return false;
    }

    for (let i = 0; i < path.length; i++) {
        for (let j = 0; j < ids.length; j++) {
            if (path[i].id === ids[j]) {
                return true;
            }
        }
    }

    return false;
}

const fetchLimit = 25;

export default Vue.extend({
    components: {
        "render-tags-input": RenderTagsInput
    },
    //
    data: function() {
        return {
            opened: false,
            focused: false,
            //
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
        document.addEventListener("click", ev => {
            if (this.opened) {
                // TODO
                if (!isElementInPath(ev, "render-wrapper", "input-wrapper", "tags-list", "operators-list")) {
                    this.focused = false;
                }
            }
        });

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
        },
        focusInput() {
            this.focused = true;

            this.$nextTick(() => {
                let elem = this.$refs["expression-input"];
                if (elem instanceof HTMLElement) elem.focus();
            });
        },
        //
        search() {
            EventBus.$emit(Events.resetFilesBlockScroll);

            API.files.fetch(
                this.expression,
                this.textToSearch,
                this.isRegexp,
                this.sortType,
                this.sortOrder,
                0,
                fetchLimit,
                true
            );
        }
    }
});
</script>
