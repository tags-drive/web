<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo"><span class="noselect">Tags Drive</span></div>

	<!-- Search bar -->
	<div id="search">
		<div id="expression">
			<input
				id="expression__input"
				type="search"
				placeholder="Logical expression"
				v-model="expression">
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
    height: 80%;
    margin-bottom: auto;
    margin-top: auto;
    position: relative;
    width: 75%;
    justify-content: space-around;
}

div#expression {
    display: flex;
    height: 25px;
    margin: auto 0;
    position: relative;
    width: 60%;
}

input#expression__input {
    width: 100%;
}

div#separator {
    border-right: 1px solid black;
    height: 90%;
}

div#text-search {
    display: flex;
    height: 25px;
    margin-top: auto;
    margin-bottom: auto;
    width: 30%;
}

div#text-search > input {
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
            showTagsList: false,
            // Text search
            text: ""
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
                        .then(data => data.json())
                        .then(files => {
                            this.SharedStore.commit("setFiles", files);
                            EventBus.$emit(Events.ResetSortParams);
                        });
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
                        .then(data => data.json())
                        .then(files => this.SharedStore.commit("setFiles", files));
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
        }
    }
};
</script>
