<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo"><span class="noselect">Tags Drive</span></div>

	<div id="search-wrapper">
		<div
			id="search-button"
			class="noselect vertically button"
		>
			<div>
				<i
					class="material-icons noselect"
					@click="search().usual()"
				>search</i>
			</div>
		</div>

		<div id="search-input">
			<div
				v-show="focused || expression === ''"
				id="input-wrapper"
			>
				<input
					id="expression-input"
					type="text"
					placeholder="Enter logical expression"
					ref="expression-input"
					v-model="expression">
			</div>
			<div
				v-if="!focused"
				id="render-wrapper"
				@click="focusInput"
			>
				<render-tags-input
					:expression="expression"
				></render-tags-input>
			</div>

			<div
				v-show="focused"
				id="tags-list"
			>
				<div
					v-for="(id, index) in allTagsIDs"
					style="display: flex; margin: 5px;"
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
					<i style="line-height: 28px;">id: {{id}}</i>
				</div>
			</div>
		</div>

		<div id="advanced-options">

		</div>
	</div>

	<div id="options">
		<!-- Global Tag editing -->
		<div
			id="tag-editing-button"
			class="vertically noselect button"
			title="Change tags"
			@click="management().globalTags()"
		>
			<div>
				<i class="material-icons">local_offer</i>
			</div>
		</div>

		<!-- Settings -->
		<div
			id="settings-button"
			class="vertically noselect button"
			title="Settings"
			@click="management().settings()"
		>
			<div>
				<i class="material-icons">settings</i>
			</div>
		</div>

		<!-- Log out -->
		<div
			id="logout"
			class="vertically noselect button"
			title="Log out"
			@click="management().logout()"
		>
			<div>
				<i class="material-icons">exit_to_app</i>
			</div>
		</div>
	</div>
</div>
</template>

<style scoped>
#top-bar {
    background-color: white;
    border-bottom: 1px solid #0000002f;
    display: flex;
    justify-content: space-around;
    height: 50px;
    top: 0;
    width: 100%;
}

#logo {
    cursor: default;
    font-family: none;
    font-size: 25px;
    height: 50px;
    line-height: 50px;
    margin: 0 10px 0 10px;
    vertical-align: middle;
}

#search-wrapper {
    border-radius: 5px;
    box-shadow: 0px 0px 5px 0px #888888;
    display: flex;
    height: 80%;
    position: relative;
    margin: auto 0 auto 0;
    width: 600px;
}

#search-wrapper > #search-button {
    height: 35px;
    margin-left: 5px;
    width: 35px;
}

#search-input > #input-wrapper {
    height: 30px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 500px;
}

#search-input > #input-wrapper > #expression-input {
    border: none;
    box-sizing: border-box;
    font-size: 16px;
    height: inherit;
    outline: none;
    width: inherit;
}

#search-input > #render-wrapper {
    box-sizing: border-box;
    cursor: text;
    height: 30px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 500px;
}

#search-input > #tags-list {
    background-color: white;
    border: 1px solid #88888880;
    border-radius: 0px 0px 5px 5px;
    border-top: none;
    height: auto;
    max-height: 500px;
    overflow-y: auto;
    position: absolute;
    top: 100%;
    width: 250px;
    z-index: 2;
}

#options {
    display: flex;
}

.button {
    border-radius: 50%;
    cursor: pointer;
    height: 40px;
    line-height: 40px;
    margin-right: 5px;
    position: relative;
    text-align: center;
    width: 40px;
}

.button > div {
    height: 30px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
}

.button div > i {
    font-size: 30px;
    vertical-align: baseline;
}

.button:hover {
    background-color: #88888840;
}

.button:last-child {
    margin-right: 0;
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
            if (!isElementInPath(event, "render-wrapper", "input-wrapper", "tags-list")) {
                this.focused = false;
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

    addTagID(argID: number) {
		let id = String(argID);
        let elem: HTMLInputElement = <HTMLInputElement>this.$refs["expression-input"];
        if (!(this.$refs["expression-input"] instanceof HTMLInputElement)) {
            return;
        }

        let l = elem.selectionStart!,
            r = elem.selectionEnd!;

        this.expression = this.expression.slice(0, l) + id + this.expression.slice(r);

        this.$nextTick(() => {
            elem.focus();
            elem.setSelectionRange(l + id.length, l + id.length);
        });
    }

    focusInput() {
        this.focused = true;
        this.$nextTick(() => {
            let elem = this.$refs["expression-input"];
            if (elem instanceof HTMLElement) elem.focus();
        });
    }
}
</script>
