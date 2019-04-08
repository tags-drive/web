<template>
<div>
	<div id="search">
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
					readonly="true"
					placeholder="Enter logical expression"
					ref="expression-input"
					v-model="expression">

				<div id="backspace">
					<i
						class="material-icons noselect"
						@click="backspace"
					>backspace</i>
				</div>
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

			<div
				v-if="focused"
				id="suggestions"
			>
				<!-- List of tags -->
				<div id="tags-list">
					<div
						v-for="(id, index) in allTagsIDs"
						style="display: flex; margin: 5px;"
						:key="index"
					>
						<!-- @click in tag component doesn't work, so we need a wrapper -->
						<div @click="insertTextIntoExpression(id)">
							<tag
							style="cursor: pointer;"
							title="Paste tag"
								:tag="Store.allTags.get(id)"
							></tag>
						</div>
						<i style="line-height: 28px;">id: {{id}}</i>
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
						class="element"
					>
						<div
							class="operator vertically"
							@click="insertTextIntoExpression(op.operator)"
						>{{ op.operator }}</div>
						<div class="description">– {{ op.description }}</div>
					</div>
				</div>
			</div>
		</div>

		<div id="separator"></div>

		<!-- Advanced options -->
		<div id="advanced-options">
			<!-- Sort options -->
			<div class="advanced-option">
				<div class="label">Sort options</div>

				<div class="select-wrapper">
					<select v-model="sortType">
						<option
							v-for="(option, index) in sortTypeOptions"
							:key="index"
							:value="option.value"
						>{{ option.text }}</option>
					</select>

					<select v-model="sortOrder">
						<option
							v-for="(option, index) in sortOrderOptions"
							:key="index"
							:value="option.value"
						>{{ option.text }}</option>
					</select>
				</div>
			</div>

			<!-- Text/Regexp to search -->
			<div class="advanced-option">
				<div class="label">{{ isRegexp ? "Regexp" : "Text to search" }}</div>

				<div class="input-wrapper">
					<input
						type="text"
						:placeholder="isRegexp ? 'Enter regexp' : 'Enter text'"
						v-model="textToSearch"
						@keyup.enter="search().usual()">
				</div>
			</div>

			<!-- isRegexp checkbox -->
			<div class="advanced-option">
				<div class="label">Use regexp</div>

				<div class="checkbox-wrapper">
					<input
						type="checkbox"
						title="Use regular expression"
						v-model="isRegexp">
				</div>
			</div>

			<div class="advanced-option" style="margin-top: 20px;">
				<div class="label">Reset</div>

				<div
					class="button-wrapper"
					@click="resetOptions"
				>
					<i class="material-icons noselect">clear</i>
				</div>
			</div>
		</div>
	</div>

	<div
		id="search-button"
		@click="search"
	>
		<i class="material-icons noselect">search</i>
		<span>Search</span>
	</div>
</div>
</template>

<style lang="scss" scoped>
@mixin button {
    $height: 40px;
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

$min-flex-screen-width: 800px;

#search {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    padding: 5px;

    @media screen and (min-width: $min-flex-screen-width) {
        #separator {
            border: 0.5px solid #0000002f;
        }
    }

    #search-input {
        $min-height: 40px;

        height: fit-content;
        overflow-y: auto;
        position: relative;
        margin-bottom: 10px;
        max-height: 320px;
        width: 100%;

        @media screen and (min-width: $min-flex-screen-width) {
            width: 45%;
            max-width: 45%;
        }

        @mixin wrapper {
            border-bottom: 1px solid #888888;
            box-sizing: border-box;
            cursor: text;
            min-height: $min-height;
            width: 100%;
        }

        #input-wrapper {
            @include wrapper();

            background-color: white;
            display: flex;
            position: sticky;
            top: 0;

            #expression-input {
                border: none;
                box-sizing: border-box;
                font-size: 16px;
                height: $min-height;
                outline: none;
                width: calc(100% - 34px);
            }

            #backspace {
                @include button();

                position: relative;
                height: 30px;
                margin: auto 0;
                width: 30px;

                i {
                    font-size: 24px;
                    left: 50%;
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }

        #render-wrapper {
            @include wrapper();

            min-height: $min-height;
        }

        #suggestions {
            display: flex;
            height: 200px;
            margin: auto;
            max-width: 500px;
            min-width: 350px;
            width: 90%;

            #operators-list {
                margin: 0 5px 0 auto;

                .element {
                    $operator-size: 23px;
                    $operator-border-size: 1px;
                    $height: 28px;
                    $width: $operator-size + 2 * $operator-border-size;

                    display: grid;
                    grid-template-columns: $width auto;
                    min-height: $height;
                    line-height: $height;
                    margin: 5px 0;

                    .operator {
                        border: $operator-border-size solid #42404033;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        height: $operator-size;
                        line-height: $operator-size;
                        margin: auto 0;
                        text-align: center;
                        width: 23px;
                    }

                    .description {
                        padding-left: 5px;
                    }
                }
            }
        }
    }

    #advanced-options {
        @media screen and (min-width: $min-flex-screen-width) {
            max-width: 45%;
            width: 45%;
        }

        .advanced-option {
            $height: 30px;
            $label-width: 120px;
            $option-width: 200px;

            display: flex;
            height: $height;
            margin-bottom: 10px;

            .label {
                font-size: 18px;
                line-height: $height;
                margin-right: 10px;
                min-width: 120px;
            }

            .input-wrapper {
                height: $height;
                width: $option-width;

                input {
                    height: $height;
                    padding: 0;
                    width: 100%;
                }
            }

            .select-wrapper {
                display: flex;
                justify-content: space-between;
                width: $option-width;

                select {
                    height: $height;
                }
            }

            .checkbox-wrapper {
                height: fit-content;
                margin: auto 0;

                input[type="checkbox"] {
                    margin: 0;
                    padding: 0;
                    outline: none;
                }
            }

            .button-wrapper {
                border-radius: 3px;

                &:active {
                    background-color: #dcdcdc70;
                }

                i {
                    font-size: $height;
                }
            }
        }
    }
}

#search-button {
    @include button();

    border: 1px solid #88888880;
    font-size: 18px;
    margin: 20px auto 0;
    padding: 3px 7px 3px 5px;
    width: fit-content;
}
</style>

<script lang="ts">
import Vue from "vue";
// Components and classes
import TagComponent from "@app/mobile/components/Tag.vue";
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

export default Vue.extend({
    data: function() {
        return {
            focused: false,
            //
            expression: "",
            textToSearch: "",
            isRegexp: false,
            sortType: "name",
            sortOrder: "asc",
            //
            sortTypeOptions: [
                { text: "By name", value: "name" },
                { text: "By size", value: "size" },
                { text: "By time", value: "time" }
            ],
            sortOrderOptions: [{ text: "Ascending", value: "asc" }, { text: "Descending", value: "desc" }],
            //
            Store: SharedStore.state,
            operators: availableOperators
        };
    },
    computed: {
        allTagsIDs: function() {
            // For reactive updating (see @app/index/store/types.ts for more information)
            return Array.from(this.Store.allTags.keys());
        }
    },
    //
    components: {
        "render-tags-input": RenderTagsInput,
        tag: TagComponent
    },
    //
    created: function() {
        document.addEventListener("click", ev => {
            if (
                this.focused &&
                !isElementInPath(ev, "render-wrapper", "input-wrapper", "tags-list", "operators-list")
            ) {
                this.focused = false;
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
        focusInput() {
            this.focused = true;

            this.$nextTick(() => {
                let elem = this.$refs["expression-input"];
                if (elem instanceof HTMLElement) elem.focus();
            });
        },
        //
        search() {
            // Close window
            this.$parent.$emit("close-bar");

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
        },
        resetOptions() {
            this.expression = "";
            this.textToSearch = "";
            this.isRegexp = false;
            this.sortType = "name";
            this.sortOrder = "asc";
        },
        //
        insertTextIntoExpression(arg: any) {
            let text = String(arg);
            let elem: HTMLInputElement = <HTMLInputElement>this.$refs["expression-input"];
            if (!(this.$refs["expression-input"] instanceof HTMLInputElement)) {
                return;
            }

            let l = elem.selectionStart!,
                r = elem.selectionEnd!;

            this.expression = this.expression.slice(0, l) + text + this.expression.slice(r);

            elem.focus();
            this.$nextTick(() => {
                elem.selectionStart = l + text.length;
                elem.selectionEnd = elem.selectionStart;
            });
        },
        backspace() {
            let elem: HTMLInputElement = <HTMLInputElement>this.$refs["expression-input"];
            if (!(this.$refs["expression-input"] instanceof HTMLInputElement)) {
                return;
            }

            let l = elem.selectionStart!,
                r = elem.selectionEnd!;
            if (l === 0 && r === 0) {
                return;
            }

            this.expression = this.expression.slice(0, l - 1) + this.expression.slice(r);

            elem.focus();
            this.$nextTick(() => {
                elem.selectionStart = l - 1;
                elem.selectionEnd = elem.selectionStart;
            });
        }
    }
});
</script>
