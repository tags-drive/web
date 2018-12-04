<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo"><span class="noselect">Tags Drive</span></div>
	<!-- Search bar -->
	<div id="search">
		<div id="expression">
			<div style="position: relative; width: 100%; height: 100%;">
				<div
					v-if="focused"
					id="cursor"
					:style="{'left': position * 18 * 0.6 + 'px'}"
				>
				</div>

				<div
					id="expression-input"
					placeholder="Logical expression"
					tabindex="0"
					@keydown.enter="search().usual()"

					@click="changeCursorPosition"

					@focus="() => { focused = true; addListener(); }"
					
				>
					<span
						v-if="focused"
						style="line-height: 25px; font-size: 18px;"
					>
						{{expression}}
					</span>
					<div
						v-if="!focused"
						style="height: inherit;"
					>
						<render-tags-input
							:expression="expression"
							style="line-height: 25px; margin: auto 0; height: 100%;"
						></render-tags-input>
					</div>
				</div>

				<div
					v-show="focused"
					id="tags-list"
				>
					<div
						v-for="(id, index) in Array.from(Store.allTags.keys())"
						style="display: flex; margin: 5px; vertical-align: center"
						:key="index"
					>
						<!-- @click in tag component doesn't work, so we need a wrapper -->
						<div @click="addTagID(id)">
							<tag
							style="cursor: pointer;"
							title="Paste tag"
								:tag="Store.allTags.get(id)"
							></tag>
						</div>
						<i style="line-height: 26px;">id: {{id}}</i>
					</div>
				</div>
			</div>
		</div>

		<!-- Separator -->
		<div id="separator"	class="vertically"></div>

		<div id="text-search">
			<input
				type="text"
				placeholder="Text for search"
				v-model="text"
				@keydown.enter="search().usual()">
		</div>

		<div id="search-button">
			<i
				class="material-icons noselect"
				@click="search().usual()"
			>search</i>
		</div>
	</div>

	<!-- Global Tag editing -->
	<div
		id="tag-editing-button"
		class="vertically noselect"
		title="Change tags"
		@click="management().globalTags()"
	>
		<img src="/static/icons/tag.png">
	</div>

	<!-- Settings -->
	<div
		id="settings-button"
		class="vertically noselect"
		title="Settings"
		@click="management().settings()"
	>
		<i style="font-size: 30px;" class="material-icons">settings</i>
	</div>

	<!-- Log out -->
	<div
		id="logout"
		class="vertically noselect"
		title="Log out"
		@click="management().logout()"
	>
		<i class="material-icons" style="font-size: 30px;">exit_to_app</i>
	</div>
</div>
</template>

<style scoped>
#top-bar {
    background-color: var(--primary-color);
    border-bottom: 1px var(--primary-border-color) solid;
    display: flex;
    justify-content: center;
    height: 50px;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 1;
}

#logo {
    cursor: default;
    font-size: 25px;
    height: 50px;
    line-height: 50px;
    margin: 0 10px 0 10px;
    vertical-align: middle;
}

#search {
    background-color: var(--primary-color);
    border: 1px var(--secondary-border-color) solid;
    border-radius: 5px;
    display: flex;
    font: 16px "Courier New", Courier, monospace;
    height: 80%;
    margin-bottom: auto;
    margin-top: auto;
    position: relative;
    width: 70%;
    justify-content: space-around;
}

div#expression {
    height: 25px;
    margin: auto 0;
    position: relative;
    width: 60%;
}

div#expression-input {
    box-sizing: border-box;
    border: 1px solid black;
    cursor: text;
    height: 100%;
    margin: auto 0;
    padding-left: 3px;
    position: absolute;
    width: 100%;
}

div#tags-list {
    background-color: white;
    border: 1px solid black;
    height: auto;
    max-height: 500px;
    overflow-y: auto;
    position: absolute;
    top: 30px;
    width: 250px;
}

div#cursor {
    border-right: 1.5px solid black;
    height: 75%; /* addition 5% for padding of div#expression-input */
    left: 0;
    margin: auto 0px auto 3px;
    position: absolute;
    top: 15%;
}

div#separator {
    border-right: 1px solid black;
    height: 90%;
}

div#text-search {
    height: 25px;
    margin: auto 0px;
    width: 30%;
}

div#text-search > input {
    border: 1px solid black;
    box-sizing: border-box;
    height: 100%;
    padding: 0;
    width: 100%;
}

div#search-button > i {
    font-size: 37px;
    cursor: pointer;
}

#tag-editing-button {
    cursor: pointer;
    height: 80%;
    margin-left: 10px;
    position: relative;
    width: 30px;
    margin-right: 5px;
}

#tag-editing-button > img {
    /* middle */
    bottom: 0;
    margin: auto;
    position: absolute;
    top: 0;
    width: 100%;
}

#settings-button {
    cursor: pointer;
}

#logout {
    margin-left: 5px;
    cursor: pointer;
    width: 35px;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import TagComponent from "./components/Tag.vue";
import RenderTagsInput from "./components/RenderTagsInput.vue";
// Store
import SharedStore from "./store";
import { Store, Tag } from "@/index/store/types";
// Event
import { Events, EventBus } from "./eventBus";
// Utils
import { Params } from "../global";
import { isErrorStatusCode, logError, logInfo } from "./tools";

const fontWidth = 18 * 0.6; // px * em

@Component({
    components: {
        tag: TagComponent,
        "render-tags-input": RenderTagsInput
    }
})
export default class TopBar extends Vue {
    // Expression
    expression: string;
    position: number;
    showTagsList: boolean;
    focused: boolean;
    // Text search
    text: string;
    Store: Store;

    constructor() {
        super();

        this.expression = "";
        this.position = 0;
        this.showTagsList = false;
        this.focused = false;
        this.text = "";
        this.Store = SharedStore.state;
    }

    created() {
        document.addEventListener("click", event => {
            let ev = event as any;
            // We need to use type any because EventMouse hasn't property path, composedPath and composedPath().
            // Nevertheless, it's a cross browser way to get path.
            let path = ev.path || (ev.composedPath && ev.composedPath());

            for (let i in path) {
                // We don't render expression or close tags list if there's element with id == "expression" in path
                if (path[i].id == "expression") {
                    return;
                }
            }

            this.focused = false;
            this.removeListener();
        });
    }

    mounted() {
        EventBus.$on(Events.UsualSearch, () => {
            this.search().usual();
        });
        EventBus.$on(Events.AdvancedSearch, (payload: any) => {
            if (payload.type == undefined || payload.order == undefined) {
                /* eslint-disable no-console */
                console.error("Payload hasn't order or type fields:", payload);
                /* eslint-enable no-console */
                return;
            }
            this.search().advanced(payload.type, payload.order);
        });
    }

    search() {
        return {
            usual: () => {
                EventBus.$emit(Events.UnselectAllFiles);

                let params = new URLSearchParams();
                // Expression
                if (this.expression != "") {
                    params.append("expr", this.expression);
                }
                // search
                if (this.text != "") {
                    params.append("search", this.text);
                }

                // Can skip sort and order, because server will use default values

                fetch(Params.Host + "/api/files?" + params, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => {
                        if (isErrorStatusCode(resp.status)) {
                            resp.text().then(text => {
                                logError(text);
                            });
                            return;
                        }
                        return resp.json();
                    })
                    .then(files => {
                        if (files === undefined) {
                            return;
                        }
                        SharedStore.commit("setFiles", files);
                        EventBus.$emit(Events.ResetSortParams);
                    })
                    .catch(err => logError(err));
            },
            advanced: (sType: string, sOrder: string) => {
                EventBus.$emit(Events.UnselectAllFiles);

                let params = new URLSearchParams();
                // Expression
                if (this.expression != "") {
                    params.append("expr", this.expression);
                }
                // search
                if (this.text != "") {
                    params.append("search", this.text);
                }
                // sort
                params.append("sort", sType);
                // order
                params.append("order", sOrder);

                fetch(Params.Host + "/api/files?" + params, {
                    method: "GET",
                    credentials: "same-origin"
                })
                    .then(resp => {
                        if (isErrorStatusCode(resp.status)) {
                            resp.text().then(text => {
                                logError(text);
                            });
                            return;
                        }
                        return resp.json();
                    })
                    .then(files => {
                        if (files === undefined) {
                            return;
                        }
                        SharedStore.commit("setFiles", files);
                        EventBus.$emit(Events.ResetSortParams);
                    })
                    .catch(err => logError(err));
            }
        };
    }

    management() {
        return {
            globalTags: () => {
                EventBus.$emit(Events.GlobalTagsChanging);
            },
            settings: () => {
                EventBus.$emit(Events.SettingsMenu);
            },
            logout: () => {
                if (!confirm("Are you sure you want log out?")) {
                    return;
                }

                fetch(Params.Host + "/logout", {
                    method: "POST",
                    credentials: "same-origin"
                })
                    .then(resp => {
                        if (isErrorStatusCode(resp.status)) {
                            resp.text().then(text => {
                                logError(text);
                            });
                            return;
                        }

                        location.reload(true);
                    })
                    .catch(err => logError(err));
            }
        };
    }

    changeCursorPosition(event: MouseEvent) {
        let x = event.offsetX > 0 ? event.offsetX : 0;
        let pos = Math.round(x / fontWidth);
        this.position = pos < this.expression.length ? pos : this.expression.length;
    }

    addTagID(id: number) {
        let text = String(id);
        this.expression = this.expression.substr(0, this.position) + text + this.expression.substr(this.position);
        this.position += text.length;
    }

    addListener() {
        document.addEventListener("keydown", this.onkeydownListener);

        // Paste event
        const elem: HTMLElement = document.getElementById("expression-input")!;
        elem.onpaste = ev => {
            let text = ev.clipboardData.getData("Text");
            this.expression = this.expression.substr(0, this.position) + text + this.expression.substr(this.position);
            this.position += text.length;
        };
    }

    removeListener() {
        document.removeEventListener("keydown", this.onkeydownListener);
    }

    onkeydownListener(ev: KeyboardEvent) {
        let hasPrefix = (str: string, prefix: string) => {
            if (str.length < prefix.length) {
                return false;
            }

            for (let i = 0; i < prefix.length; i++) {
                if (str[i] != prefix[i]) {
                    return false;
                }
            }
            return true;
        };

        if (ev.ctrlKey || ev.altKey) {
            return;
        }

        if (
            ev.key.length == 1 &&
            (hasPrefix(ev.code, "Key") ||
                ev.key == "(" ||
                ev.key == ")" ||
                ev.key == "|" ||
                hasPrefix(ev.code, "Numpad") ||
                hasPrefix(ev.code, "Digit"))
        ) {
            this.expression = this.expression.substr(0, this.position) + ev.key + this.expression.substr(this.position);

            this.position++;
        } else if (hasPrefix(ev.code, "Arrow")) {
            // Arrow
            if (hasPrefix(ev.code, "ArrowLeft")) {
                if (this.position > 0) {
                    this.position--;
                }
            } else if (hasPrefix(ev.code, "ArrowRight")) {
                if (this.position < this.expression.length) {
                    this.position++;
                }
            }
        } else if (hasPrefix(ev.code, "Backspace")) {
            if (this.position == 0) {
                return;
            }
            this.expression = this.expression.substr(0, this.position - 1) + this.expression.substr(this.position);
            this.position--;
        } else if (hasPrefix(ev.code, "Delete")) {
            this.expression = this.expression.substr(0, this.position) + this.expression.substr(this.position + 1);
        } else if (ev.code == "Home") {
            this.position = 0;
        } else if (ev.code == "End") {
            this.position = this.expression.length;
        }
    }
}
</script>
