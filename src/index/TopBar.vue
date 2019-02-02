<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo"><span class="noselect">Tags Drive</span></div>

	<div id="search-wrapper">

	</div>

	<!-- Global Tag editing -->
	<div
		id="tag-editing-button"
		class="vertically noselect"
		title="Change tags"
		@click="management().globalTags()"
	>
		<i style="font-size: 30px;" class="material-icons">local_offer</i>
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
    border-bottom: 1px solid #0000002f;
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

#tag-editing-button {
    cursor: pointer;
    margin-left: 10px;
}

#settings-button {
    cursor: pointer;
    margin-left: 5px;
}

#logout {
    cursor: pointer;
    margin-left: 5px;
    width: 35px;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Components
import TagComponent from "@components/Tag/Tag.vue";
import RenderTagsInput from "@components/RenderTagsInput/RenderTagsInput.vue";
// Shared data
import SharedStore from "@app/index/store";
import { Store } from "@app/index/store/types";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { isErrorStatusCode, logError, logInfo, isElementInPath } from "@app/index/tools";
import { Params } from "@app/global";

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

    get allTagsIDs() {
        // For reactive updating (see @app/index/store/types.ts for more information)
        return SharedStore.state.allTagsChangesCounter && Array.from(SharedStore.state.allTags.keys());
    }

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
        EventBus.$on(Events.Search.Usual, () => {
            this.search().usual();
        });
        EventBus.$on(Events.Search.Advanced, (payload: any) => {
            if (payload.type === undefined || payload.order === undefined) {
                /* eslint-disable no-console */
                console.error("Payload hasn't order or type fields:", payload);
                /* eslint-enable no-console */
                return;
            }
            this.search().advanced(payload.type, payload.order);
        });

        document.addEventListener("click", event => {
            if (!isElementInPath(event, "expression")) {
                this.focused = false;
                this.removeListener();
            }
        });
    }

    search() {
        return {
            usual: () => {
                EventBus.$emit(Events.FilesBlock.UnselectAllFiles);

                let params = new URLSearchParams();
                // Expression
                if (this.expression !== "") {
                    params.append("expr", this.expression);
                }
                // search
                if (this.text !== "") {
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
                        EventBus.$emit(Events.FilesBlock.RestoreSortParams);
                    })
                    .catch(err => logError(err));
            },
            advanced: (sType: string, sOrder: string) => {
                EventBus.$emit(Events.FilesBlock.UnselectAllFiles);

                let params = new URLSearchParams();
                // Expression
                if (this.expression !== "") {
                    params.append("expr", this.expression);
                }
                // search
                if (this.text !== "") {
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
                    })
                    .catch(err => logError(err));
            }
        };
    }

    management() {
        return {
            globalTags: () => {
                EventBus.$emit(Events.ModalWindow.ShowTagsChangingWindow);
            },
            settings: () => {
                EventBus.$emit(Events.ModalWindow.ShowSettingsWindow);
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
                if (str[i] !== prefix[i]) {
                    return false;
                }
            }
            return true;
        };

        if (ev.ctrlKey || ev.altKey) {
            return;
        }

        if (
            ev.key.length === 1 &&
            (hasPrefix(ev.code, "Key") ||
                ev.key === "(" ||
                ev.key === ")" ||
                ev.key === "|" ||
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
            if (this.position === 0) {
                return;
            }
            this.expression = this.expression.substr(0, this.position - 1) + this.expression.substr(this.position);
            this.position--;
        } else if (hasPrefix(ev.code, "Delete")) {
            this.expression = this.expression.substr(0, this.position) + this.expression.substr(this.position + 1);
        } else if (ev.code === "Home") {
            this.position = 0;
        } else if (ev.code === "End") {
            this.position = this.expression.length;
        }
    }
}
</script>
