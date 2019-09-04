<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo" class="noselect">
		<img src="/static/icons/logo.svg" alt="Tags Drive" draggable="false">
	</div>

	<div id="search-bar-wrapper">
		<!-- Search button -->
		<div
			class="noselect vertically button buttons__search"
			style="margin-left: 5px;"
		>
			<div>
				<i
					class="material-icons noselect"
					@click="search()"
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
						@keyup.enter="search()"
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
						v-for="(group, i) in groupedTags"
						:key="i"
						class="group"
					>
						<div
							class="group-name noselect"
							:title="group.show ? 'Hide group' : 'Show group'"
							@click="toggleGroupVisibility(group.name)"
						>
							<i class="material-icons">navigate_next</i>
							<div>
								<span>{{ group.name }}</span>
								<span>{{ !group.show ? ' ...' : ''}}</span>
							</div>
						</div>

						<div
							v-if="group.show"
							class="tags-list"
						>
							<div
								v-for="(tag, j) in group.tags"
								:key="j"
								class="tag"
							>
								<!-- @click in tag component doesn't work, so we need a wrapper -->
								<div @click="insertTextIntoExpression(tag.id)">
									<tag
										style="cursor: pointer;"
										title="Paste tag"
										:tag="tag"
									></tag>
								</div>
								<i style="line-height: 28px;">id: {{tag.id}}</i>
							</div>
						</div>
					</div>
				</div>

				<!-- List of operators -->
				<div
					v-show="focused"
					id="operators-list"
				>
					<div
						v-for="(op, index) in operators"
						:key="index"
					>
						<div
							class="operator vertically"
							@click="insertTextIntoExpression(op.operator)"
						>{{ op.operator }}</div>
						<span>– {{ op.description }}</span>
					</div>
				</div>
			</div>

			<!-- Reset input -->
			<div
				id="reset-input-button"
				class="noselect vertically"
				:class="{ 'button buttons__search' : showResetButton }"
				style="width: 25px; height: 25px;"
			>
				<div
					v-show="showResetButton"
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
				<div class="label">
					{{ isRegexp ? "Regexp" : "Text to search" }}
				</div>
				<div class="input-wrapper">
					<input
						type="text"
						:placeholder="isRegexp ? 'Enter regexp' : 'Enter text'"
						v-model="text"
						@keyup.enter="search()">
				</div>
			</div>

			<div class="advanced-option">
				<div class="label">Use regexp</div>
				<div class="input-wrapper">
					<div class="checkbox-wrapper">
						<input
							type="checkbox"
							title="Use regular expression"
							v-model="isRegexp">
					</div>
				</div>
			</div>
		</div>

		<!-- Show advanced options -->
		<div
			id="advanced-options-toggle-button"
			class="noselect vertically button buttons__search"
		>
			<div @click="toggleAdvancedOptions">
				<i
					v-if="!showAdvancedOptions"
					class="material-icons noselect"
					title="Show advanced options"
				>arrow_drop_down</i>
				<i
					v-else
					class="material-icons noselect"
					title="Hide advanced options"
				>arrow_drop_up</i>

				<!-- Show when advanced options are used -->
				<div
					v-if="usedAdvancedOptions"
					style="position: absolute; right: 3px; top: -10px; z-index: 0;"
				>*</div>
			</div>
		</div>
	</div>

	<div id="options">
		<!-- Global Tag editing -->
		<div
			id="tag-editing-button"
			class="vertically noselect button"
			title="Change tags"
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
			@click="management().globalTags()"
		>
			<div>
				<i class="material-icons" style="transform: scaleX(-1);">local_offer</i>
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
			:class="{ 'auth-only-element': !showAuthOnlyElement }"
			@click="management().logout()"
		>
			<div>
				<i class="material-icons">exit_to_app</i>
			</div>
		</div>
	</div>
</div>
</template>


<style lang="scss" scoped>
#top-bar {
    background-color: white;
    border-bottom: 1px solid #0000002f;
    column-gap: 20px;
    display: grid;
    grid-template-columns: 170px minmax(600px, 1000px) 150px;
    justify-content: space-evenly;
    height: 50px;
    top: 0;
    width: 100%;
}

// Logo
#logo {
    text-align: center;

    > img {
        height: 100%;
        pointer-events: none;
        width: 90%;
    }
}

// Search
#search-bar-wrapper {
    border: 1px solid #eeeeee;
    border-radius: 5px;
    column-gap: 5px;
    display: grid;
    grid-template-columns: 50px auto 50px;
    height: 40px;
    margin: auto 0 auto 0;
    position: relative;

    // Search input and suggestions

    > #search-input-wrapper {
        display: flex;
        height: 40px;
        margin: auto 0;
        justify-content: center;

        > #search-input {
            margin: auto 0;
            height: 40px;
            position: relative;
            width: 100%;

            // Inputs

            #input-wrapper,
            #render-wrapper {
                box-sizing: border-box;
                cursor: text;
                height: 100%;
                overflow-y: auto;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 100%;
            }

            > #input-wrapper {
                > #expression-input {
                    border: none;
                    box-sizing: border-box;
                    font-size: 16px;
                    height: inherit;
                    outline: none;
                    width: inherit;
                }
            }

            > #reset-input-button {
                position: absolute;
                right: 5px;
            }

            // Suggestions

            @mixin suggestion-blocks {
                background-color: white;
                border: 1px solid #88888880;
                border-radius: 0px 0px 5px 5px;
                border-top: none;
                height: auto;
                max-height: 500px;
                overflow-y: auto;
                position: absolute;
                top: 100%;
                z-index: 2;
            }

            $tags-list-width: 250px;

            > #tags-list {
                @include suggestion-blocks();

                width: $tags-list-width;

                .group {
                    padding: 0 5px;

                    &:last-child {
                        margin-bottom: 10px;
                    }

                    > div.group-name {
                        border-radius: 5px;
                        cursor: pointer;
                        display: inline-flex;
                        min-height: 25px;
                        line-height: 25px;
                        word-break: break-all;
                    }

                    > div.tags-list {
                        // Indentation
                        margin-left: 20px;

                        > .tag {
                            display: flex;
                            margin: 5px;
                        }
                    }
                }
            }

            > #operators-list {
                @include suggestion-blocks();

                border-bottom-left-radius: 0;
                border-left-color: #88888840;
                left: $tags-list-width + 1px;
                width: 180px;

                > div {
                    display: flex;
                    line-height: 28px;
                    margin: 5px;

                    .operator {
                        border: 1px solid #42404033;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        height: 23px;
                        line-height: 23px;
                        margin-right: 4px;
                        text-align: center;
                        width: 23px;
                    }
                }
            }
        }
    }

    // Advanced search options

    > #advanced-options {
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

        .advanced-option {
            font-size: 15px;
            height: 25px;
            line-height: 25px;
            position: relative;
            margin-bottom: 10px;

            > .label {
                left: 10px;
                position: absolute;
            }

            > .input-wrapper {
                height: 100%;
                position: absolute;
                right: 10px;
                width: 250px;

                > input {
                    width: 100%;
                }

                > div.checkbox-wrapper {
                    height: 100%;
                    position: relative;

                    > input[type="checkbox"] {
                        margin: 0;
                        outline: none;
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                }
            }
        }
    }
}

// Options
#options {
    display: flex;
    justify-content: center;
}

// Common

.button {
    border-radius: 50%;
    cursor: pointer;
    height: 40px;
    line-height: 40px;
    margin-right: 5px;
    position: relative;
    text-align: center;
    width: 40px;

    &:last-child {
        margin-right: 0;
    }

    > div {
        height: 30px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        > i {
            font-size: 30px;
            vertical-align: baseline;
        }
    }
}

.buttons__search {
    height: 35px;
    width: 35px;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components and classes
import TagComponent from "@components/Tag/Tag.vue";
import RenderTagsInput from "@components/RenderTagsInput/RenderTagsInput.vue";
import { Tag, Group, TagsToGroups } from "@app/global/classes";
// Shared data
import SharedState from "@app/index/state";
import SharedStore from "@app/index/store";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { logError, logInfo } from "@app/index/utils";
import { IsElementInPath } from "@app/global/utils";
import { Params } from "@app/global";
import API from "@app/index/api";
import { Const } from "@app/global/const";

class Operator {
    operator: string;
    description: string;

    constructor(op: string, desc: string = "") {
        this.operator = op;
        this.description = desc;
    }
}

const validCharacters = "0123456789&|!()";
const availableOperators: Operator[] = [
    new Operator("!", "negation (not)"),
    new Operator("&", "conjunction (and)"),
    new Operator("|", "disjunction (or)"),
    new Operator("(", "left bracket"),
    new Operator(")", "right bracket")
];

class TopBarGroup extends Group {
    show: boolean;

    constructor(group: Group) {
        super(group.name, group.tags);

        this.show = true;
    }
}

export default Vue.extend({
    components: {
        tag: TagComponent,
        "render-tags-input": RenderTagsInput
    },
    //
    data: function() {
        return {
            // Const members
            operators: availableOperators,
            // Search
            expression: "",
            text: "",
            isRegexp: false,
            sortType: Const.sortType.name,
            sortOrder: Const.sortOrder.asc,
            //
            hiddenGroups: new Set() as Set<string>,
            hiddenGroupsChangesCounter: 0,
            //
            focused: false,
            showAdvancedOptions: false,
            //
            Store: SharedStore.state,
            State: SharedState.state
        };
    },
    computed: {
        groupedTags: function(): Array<TopBarGroup> {
            // Name for group with ungrouped tags
            const ungroupedTags = "Ungrouped tags";

            let reactive = this.hiddenGroupsChangesCounter + this.Store.allTagsChangesCounter;

            let allTags = this.Store.allTags;
            let groups = TagsToGroups(allTags);

            let res: TopBarGroup[] = Array(groups.length);

            // Hide groups
            for (let i = 0; i < groups.length; i++) {
                res[i] = new TopBarGroup(groups[i]);
                if (this.hiddenGroups.has(groups[i].name)) {
                    res[i].show = false;
                }
            }

            return res;
        },
        usedAdvancedOptions: function(): boolean {
            return this.text != "" || this.isRegexp != false;
        },
        showResetButton: function(): boolean {
            return this.expression != "" || this.usedAdvancedOptions;
        },
        showAuthOnlyElement: function(): boolean {
            return this.State.user.authorized;
        }
    },
    //
    created: function() {
        EventBus.$on(Events.Search.Usual, () => {
            this.search();
        });
        EventBus.$on(Events.Search.Advanced, (payload: any) => {
            if (payload.type === undefined || payload.order === undefined) {
                /* eslint-disable no-console */
                console.error("Payload hasn't order or type fields:", payload);
                /* eslint-enable no-console */
                return;
            }

            this.sortType = payload.type as string;
            this.sortOrder = payload.order as string;

            this.search();
        });

        document.addEventListener("click", event => {
            if (!IsElementInPath(event, "render-wrapper", "input-wrapper", "tags-list", "operators-list")) {
                this.focused = false;
            }
        });
    },
    //
    methods: {
        search() {
            EventBus.$emit(Events.FilesBlock.UnselectAllFiles);
            API.files.fetch(this.expression, this.text, this.isRegexp, this.sortType, this.sortOrder);
        },
        management() {
            return {
                globalTags: () => {
                    EventBus.$emit(Events.ModalWindow.ShowTagsChangingWindow);
                },
                settings: () => {
                    EventBus.$emit(Events.ModalWindow.ShowSettingsWindow);
                },
                logout: () => {
                    API.management.logout();
                }
            };
        },
        // Grouped tags
        toggleGroupVisibility(groupName: string) {
            if (this.hiddenGroups.has(groupName)) {
                this.hiddenGroups.delete(groupName);
            } else {
                this.hiddenGroups.add(groupName);
            }

            this.hiddenGroupsChangesCounter++;
        },
        // insertTagID is used to insert tag id into expression
        insertTextIntoExpression(arg: any) {
            let text = String(arg);
            let elem = this.$refs["expression-input"] as HTMLInputElement;
            if (!(this.$refs["expression-input"] instanceof HTMLInputElement)) {
                return;
            }

            let l = elem.selectionStart!,
                r = elem.selectionEnd!;

            this.expression = this.expression.slice(0, l) + text + this.expression.slice(r);

            this.$nextTick(() => {
                elem.focus();
                elem.setSelectionRange(l + text.length, l + text.length);
            });
        },
        // For AdvancedOptions
        toggleAdvancedOptions() {
            if (this.showAdvancedOptions) {
                // Hide
                this.showAdvancedOptions = false;
                this.$nextTick(() => {
                    document.removeEventListener("click", this.advancedOptionsListener);
                });
            } else {
                // Show
                this.showAdvancedOptions = true;
                this.$nextTick(() => {
                    document.addEventListener("click", this.advancedOptionsListener);
                });
            }
        },
        advancedOptionsListener(event: MouseEvent) {
            if (
                this.showAdvancedOptions &&
                !IsElementInPath(event, "advanced-options", "advanced-options-toggle-button")
            ) {
                this.toggleAdvancedOptions();
            }
        },
        // Secondary function
        resetExpression() {
            this.expression = "";
            this.text = "";
            this.isRegexp = false;
        },
        focusInput() {
            this.focused = true;
            this.$nextTick(() => {
                let elem = this.$refs["expression-input"];
                if (elem instanceof HTMLElement) elem.focus();
            });
        },
        validateInput(ev: KeyboardEvent) {
            if (!validCharacters.includes(ev.key)) {
                ev.preventDefault();
            }
        }
    }
});
</script>
