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
					:style="{'left': position * 0.6 + 'em'}"
				>
				</div>

				<div
					id="expression-input"
					placeholder="Logical expression"
					tabindex="0"
					@keydown.enter="search().usual()"
					@focus="() => { focused = true; handler().add(); }"
					v-on-clickaway="blur"
				>
					<!--
						We use v-show because we call document.getElementByID("expression-render") 
						If it is v-if, <span id="expression-render"> doesn't exist
					-->
					<span v-show="focused" style=" line-height: 25px;">
						{{expression}}
					</span>
					<div v-show="!focused"
						id="expression-render"
						style="line-height: 25px; margin: auto 0; height: 100%;"
					></div>
				</div>

				<div
					v-show="focused"
					id="tags-list"
				>
					<div
						v-for="(tag, index) in SharedStore.state.allTags"
						style="display: flex; margin: 5px; vertical-align: center"
						:key="index"
					>
						<div
							class="tag noselect"
							style="cursor: pointer;"
							title="Paste tag"
							:style="{ 'background-color': tag.color }"
							@click="addTagID(tag.id)"
						>
							{{tag.name}}
						</div>
						<i style="line-height: 26px;">id: {{tag.id}}</i>
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

	<!-- Settings -->
	<div
		id="tag-editing-button"
		class="vertically noselect"
		@click="settings().tags()"
	>
		<img src="/static/icons/tag.png" title="Change tags">
	</div>

	<!-- Log out -->
	<div id="logout" class="vertically">
		<i class="material-icons noselect" style="font-size: 30px;" title="Log out" @click="settings().logout()">exit_to_app</i>
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
    width: 75%;
    justify-content: space-around;
}

div#expression {
    height: 25px;
    margin: auto 0;
    position: relative;
    width: 60%;
}

div#expression-input {
    cursor: text;
    border: 1px solid black;
    height: 100%;
    margin: auto 0;
    padding-left: 3px;
    position: absolute;
    width: 100%;
}

div#expression-render {
    display: flex;
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

#logout {
    margin-left: 5px;
    cursor: pointer;
    width: 35px;
}
</style>

<script>
// Mixin
import VueClickaway from "vue-clickaway2";
// Components
import SearchTag from "./components/SearchTag.vue";
import SuggestionTag from "./components/SuggestionTag.vue";
//
import { Events, EventBus } from "./eventBus";

export default {
    mixins: [VueClickaway.mixin],
    components: {
        "search-tag": SearchTag,
        "suggestion-tag": SuggestionTag
    },
    data: function() {
        return {
            // Expression
            expression: "",
            position: 0,
            showTagsList: false,
            focused: false,
            // Text search
            text: "",
            //
            onkeydownHandler: null
        };
    },
    mounted: function() {
        EventBus.$on(Events.UsualSearch, () => {
            this.search().usual();
        });
        EventBus.$on(Events.AdvancedSearch, payload => {
            if (payload.type == undefined || payload.order == undefined) {
                /* eslint-disable no-console */
                console.error("Payload hasn't order or type fields:", payload);
                /* eslint-enable no-console */
                return;
            }
            this.search().advanced(payload.type, payload.order);
        });
    },
    methods: {
        search: function() {
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

                    fetch(this.Params.Host + "/api/files?" + params, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }
                            return resp.json();
                        })
                        .then(files => {
                            if (files === undefined) {
                                return;
                            }
                            this.SharedStore.commit("setFiles", files);
                            EventBus.$emit(Events.ResetSortParams);
                        })
                        .catch(err => this.logError(err));
                },
                advanced: (sType, sOrder) => {
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

                    fetch(this.Params.Host + "/api/files?" + params, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }
                            return resp.json();
                        })
                        .then(files => {
                            if (files === undefined) {
                                return;
                            }
                            this.SharedStore.commit("setFiles", files);
                            EventBus.$emit(Events.ResetSortParams);
                        })
                        .catch(err => this.logError(err));
                }
            };
        },
        settings: function() {
            return {
                tags: () => {
                    EventBus.$emit(Events.GlobalTagsChanging);
                },
                logout: () => {
                    if (!confirm("Are you sure you want log out?")) {
                        return;
                    }

                    fetch(this.Params.Host + "/logout", {
                        method: "POST",
                        credentials: "same-origin"
                    })
                        .then(resp => {
                            if (this.isErrorStatusCode(resp.status)) {
                                resp.text().then(text => {
                                    this.logError(text);
                                });
                                return;
                            }

                            location.reload(true);
                        })
                        .catch(err => this.logError(err));
                }
            };
        },
        handler: function() {
            return {
                add: () => {
                    let hasPrefix = (str, prefix) => {
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

                    this.onkeydownHandler = window.onkeyup;
                    window.onkeydown = ev => {
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
                            this.expression =
                                this.expression.substr(0, this.position) +
                                ev.key +
                                this.expression.substr(this.position);

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
                            this.expression =
                                this.expression.substr(0, this.position - 1) + this.expression.substr(this.position);
                            this.position--;
                        } else if (hasPrefix(ev.code, "Delete")) {
                            this.expression =
                                this.expression.substr(0, this.position) + this.expression.substr(this.position + 1);
                        } else if (ev.code == "Home") {
                            this.position = 0;
                        } else if (ev.code == "End") {
                            this.position = this.expression.length;
                        }
                    };

                    // Paste event
                    document.getElementById("expression-input").onpaste = ev => {
                        let text = ev.clipboardData.getData("Text");
                        this.expression =
                            this.expression.substr(0, this.position) + text + this.expression.substr(this.position);
                        this.position += text.length;
                    };
                },
                del: () => {
                    window.onkeydown = this.onkeydownHandler;
                    this.onkeydownHandler = null;
                }
            };
        },
        render: function() {
            let regex = /(\d+)(?=&|\)|\||!| )/;
            // If there's no space at the end of string, while won't stop
            let renderText = this.expression + " ";
            while (regex.exec(renderText) != null) {
                let name = "Undefined",
                    color = "white",
                    tag;

                let id = regex.exec(renderText);
                tag = this.SharedStore.state.allTags[Number(id[1])];
                if (tag !== undefined) {
                    color = tag.color == undefined ? "white" : tag.color;
                    name = tag.name;
                }

                /* HTML code:
				<div
					class="tag"
					style="height: 16px; line-height: 16px; margin: auto 0; background-color: {{color}}"
				>
					<div>{{name}}</div>
				</div>
				*/
                let replaceStr =
                    `<div
						class="tag"
						style="height: 16px; line-height: 16px; margin: auto 0; background-color: ` +
                    color +
                    `;"><div>` +
                    name +
                    `</div></div>`;

                renderText = renderText.replace(regex, replaceStr);
            }
            // Remove last space
            renderText = renderText.slice(0, -1);
            document.getElementById("expression-render").innerHTML = renderText;
        },
        addTagID: function(id) {
            let text = String(id);
            this.expression = this.expression.substr(0, this.position) + text + this.expression.substr(this.position);
            this.position += text.length;
        },
        blur: function(event) {
            // Cross browser way to get path
            let path = event.path || (event.composedPath && event.composedPath());
            for (let i in path) {
                // It prevents blur if it was click on #tags-list
                if (path[i].id == "expression") {
                    return;
                }
            }

            this.focused = false;
            this.handler().del();
            this.render();
        }
    }
};
</script>
