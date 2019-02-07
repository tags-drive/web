<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo"><span class="noselect">Tags Drive</span></div>

	<div id="search-bar-wrapper">
		<!-- Search button -->
		<div
			class="noselect vertically button buttons__search"
			style="margin-left: 5px;"
		>
			<div>
				<i
					class="material-icons noselect"
					@click="search().usual()"
				>search</i>
			</div>
		</div>

		<!-- Search block -->
		<div id="search-input-wrapper">
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
						v-model="expression"
						@keypress="validateInput"
						@keyup.enter="search().usual()"
						@keyup.esc="focused = false">
				</div>
				<!-- Render -->
				<div
					v-show="!focused"
					id="render-wrapper"
					@click="focusInput"
				>
					<render-tags-input
						:expression="expression"
					></render-tags-input>
				</div>

				<!-- List of tags -->
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
						<div @click="insertTagID(id)">
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

			<!-- Reset input -->
			<div
				id="reset-input-button"
				class="noselect vertically button buttons__search"
				style="width: 25px; height: 25px;"
			>
				<div
					v-show="expression != ''"
					style="width: 25px; height: 25px; line-height: 25px;"
				>
					<i
						class="material-icons noselect"
						style="font-size: 25px;"
						title="Reset input"
						@click="resetExpression"
					>close</i>
				</div>
			</div>
		</div>

		<!-- Advanced options -->
		<div
			id="advanced-options"
			v-if="showAdvancedOptions"
		>
			<div class="advanced-option">
				<div class="advanced-option__label">Text to search</div>
				<div class="advanced-option__input-wrapper">
					<input
						type="text"
						placeholder="Enter text"
						v-model="text">
				</div>
			</div>
		</div>

		<!-- Show advanced options -->
		<div
			id="search-button"
			class="noselect vertically button buttons__search"
		>
			<div>
				<i
					v-if="!showAdvancedOptions"
					class="material-icons noselect"
					title="Show advanced options"
					@click="displayAdvancedOptions"
				>arrow_drop_down</i>
				<i
					v-else
					class="material-icons noselect"
					title="Hide advanced options"
					@click="hideAdvancedOptions"
				>arrow_drop_up</i>
			</div>
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

#search-bar-wrapper {
    border-radius: 5px;
    box-shadow: 0px 0px 5px 0px #888888;
    display: flex;
    height: 40px;
    justify-content: space-around;
    margin: auto 0 auto 0;
    position: relative;
    width: 600px;
}

#search-input-wrapper {
    display: flex;
    height: 40px;
    margin: auto 0;
    justify-content: center;
    width: 500px;
}

#search-input {
    margin: auto 0;
    height: 40px;
    position: relative;
    width: 450px;
}

#search-input > #input-wrapper,
#render-wrapper {
    box-sizing: border-box;
    cursor: text;
    height: -webkit-fill-available;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
}

#search-input > #input-wrapper > #expression-input {
    border: none;
    box-sizing: border-box;
    font-size: 16px;
    height: inherit;
    outline: none;
    width: inherit;
}

#search-input > #reset-input-button {
    position: absolute;
    right: 5px;
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

#search-wrapper > #search-additional-buttons {
    display: flex;
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
}

#search-bar-wrapper > #advanced-options {
    background-color: white;
    border: 1px solid #88888880;
    border-radius: 0px 0px 5px 5px;
    border-top: 1px solid #88888820;
    height: auto;
    padding: 10px 5px 0px 5px;
    position: absolute;
    right: 5px;
    top: 100%;
    width: 400px;
    z-index: 2;
}

.advanced-option {
    font-size: 15px;
    height: 25px;
    line-height: 25px;
    position: relative;
    margin-bottom: 10px;
}

.advanced-option__label {
    left: 10px;
    position: absolute;
}

.advanced-option__input-wrapper {
    position: absolute;
    right: 10px;
}

.advanced-option__input-wrapper > input {
    width: 250px;
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
    background-color: #88888830;
}

.button:last-child {
    margin-right: 0;
}

.buttons__search {
    height: 35px;
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
import API from "@app/index/api";

const validCharacters = "0123456789&|!()";

@Component({
    components: {
        tag: TagComponent,
        "render-tags-input": RenderTagsInput
    }
})
export default class TopBar extends Vue {
    // Expression
    expression: string = "";
    position: number = 0;
    showTagsList: boolean = false;
    focused: boolean = false;
    showAdvancedOptions: boolean = false;
    // Text search
    text: string = "";
    Store: Store = SharedStore.state;

    get allTagsIDs() {
        // For reactive updating (see @app/index/store/types.ts for more information)
        return SharedStore.state.allTagsChangesCounter && Array.from(SharedStore.state.allTags.keys());
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
                API.files.fetch(this.expression, this.text, "", "");
                EventBus.$emit(Events.FilesBlock.RestoreSortParams);
            },
            advanced: (sType: string, sOrder: string) => {
                EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
                API.files.fetch(this.expression, this.text, sType, sOrder);
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

    // insertTagID is used to insert tag id into expression
    insertTagID(argID: number) {
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

    // For AdvancedOptions
    displayAdvancedOptions() {
        this.showAdvancedOptions = true;
        this.$nextTick(() => {
            document.addEventListener("click", this.advancedOptionsListener);
        });
    }

    hideAdvancedOptions() {
        this.showAdvancedOptions = false;
        this.$nextTick(() => {
            document.removeEventListener("click", this.advancedOptionsListener);
        });
    }

    advancedOptionsListener(event: MouseEvent) {
        if (!isElementInPath(event, "advanced-options")) {
            this.hideAdvancedOptions();
        }
    }

    // Secondary function
    resetExpression() {
        this.expression = "";
    }

    focusInput() {
        this.focused = true;
        this.$nextTick(() => {
            let elem = this.$refs["expression-input"];
            if (elem instanceof HTMLElement) elem.focus();
        });
    }

    validateInput(ev: KeyboardEvent) {
        if (!validCharacters.includes(ev.key)) {
            ev.preventDefault();
        }
    }
}
</script>
