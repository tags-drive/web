<template>
<div id="top-bar">
	<!-- Logo -->
	<div id="logo"><span>Tags Drive</span></div>

	<!-- Search bar -->
	<div id="search">
		<div id="search__tags">
			<i
				class="material-icons"
				style="cursor: pointer; margin-right: 10px;"
				title="Add tags for search"
				@click="tagsMenu().show()"
			>
				add_circle_outline
			</i>
			<search-tag
				v-for="(tag, index) in pickedTags"
				:key="index"
				:tag="tag"></search-tag>

			<!-- List of unpicked tags-->
			<div
				id="unpicked-tags"
				v-if="showTagsList"
				v-on-clickaway="() => tagsMenu().hide()"
			>
				<div
					style="cursor: default; margin: auto;"
					v-if="unusedTags.length == 0"
				>Empty</div>

				<suggestion-tag
					v-for="(tag, index) in unusedTags"
					:key="index"
					:tag="tag"></suggestion-tag>
			</div>
		</div>

		<div style="display: flex;">
			<!-- Separator -->
			<div
				class="vertically"
				style="border-right: 1px solid black; height: 90%; margin-right: 5px;"
			></div>

			<div id="advanced-menu">
				<input v-model="text" type="text" placeholder="Text for search" style="margin-right: 5px;">

				<div class="vertically" style="margin-right: 5px;">Mode</div>
				<select
					style="margin-right: 5px;"
					v-model="selectedMode"
				>
					<option>And</option>
					<option>Or</option>
					<option>Not</option>
				</select>
			</div>

			<div style="height: 100%;">
				<i
					class="material-icons"
					style="font-size: 37px; cursor: pointer;"
					@click="search().usual()"
				>search</i>
			</div>
		</div>
	</div>

	<!-- Settings -->
	<div
		id="tag-editing-button"
		class="vertically"
		@click="settings().tags()"
	>
		<img src="/static/icons/tag.png" title="Change tags">
	</div>

	<!-- Log out -->
	<div id="logout" class="vertically">
		<i class="material-icons" style="font-size: 30px;" title="Log out" @click="settings().logout()">exit_to_app</i>
	</div>
</div>
</template>

<script>
import VueClickaway from "vue-clickaway2";
import SearchTag from "./components/SearchTag.vue";
import SuggestionTag from "./components/SuggestionTag.vue";

export default {
    mixins: [VueClickaway.mixin],
    components: {
        "search-tag": SearchTag,
        "suggestion-tag": SuggestionTag
    },
    data: function() {
        return {
            // Tag search
            tagPrefix: "",
            showTagsList: false,
            pickedTags: [],
            unusedTags: [],
            // Advanced search
            text: "",
            selectedMode: "And"
        };
    },
    methods: {
        tagsMenu: function() {
            return {
                show: () => {
                    if (this.pickedTags.length == 0) {
                        // Need to fill unusedTags
                        this.unusedTags = [];
                        for (let tag in this.SharedStore.state.allTags) {
                            this.unusedTags.push(this.SharedStore.state.allTags[tag]);
                        }
                    }

                    this.showTagsList = true;
                },
                hide: () => {
                    this.showTagsList = false;
                }
            };
        },
        search: function() {
            return {
                usual: () => {
                    let params = new URLSearchParams();
                    // tags
                    if (this.pickedTags.length != 0) {
                        let tags = [];
                        for (let tag of this.pickedTags) {
                            tags.push(tag.id);
                        }
                        params.append("tags", tags.join(","));
                    }
                    // search
                    if (this.text != "") {
                        params.append("search", this.text);
                    }
                    // mode
                    params.append("mode", this.selectedMode.toLowerCase());
                    // Can skip sort and order, because server will use default values

                    fetch("/api/files?" + params, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(data => data.json())
                        .then(files => {
                            this.SharedStore.commit("setFiles", files);
                            // TODO
                            // Reset sortParams
                            // mainBlock.sort().reset();
                        });
                },
                advanced: (sType, sOrder) => {
                    let params = new URLSearchParams();
                    // tags
                    if (this.pickedTags.length != 0) {
                        let tags = [];
                        for (let tag of this.pickedTags) {
                            tags.push(tag.name);
                        }
                        params.append("tags", tags.join(","));
                    }
                    // search
                    if (this.text != "") {
                        params.append("search", this.text);
                    }
                    // sort
                    params.append("sort", sType);
                    // order
                    params.append("order", sOrder);
                    // mode
                    params.append("mode", this.selectedMode.toLowerCase());

                    fetch("/api/files?" + params, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(data => data.json())
                        .then(files => this.SharedStore.commit("setFiles", files));
                }
            };
        },
        input: function() {
            return {
                tags: {
                    add: tagID => {
                        let index = -1;
                        for (let i in this.unusedTags) {
                            if (this.unusedTags[i].id == tagID) {
                                index = i;
                                break;
                            }
                        }
                        if (index == -1) {
                            return;
                        }

                        // Add a tag into pickedTags
                        this.pickedTags.push(this.unusedTags[index]);
                        // Remove a tag
                        this.unusedTags.splice(index, 1);
                    },
                    delete: tagID => {
                        let index = -1;
                        for (let i in this.pickedTags) {
                            if (this.pickedTags[i].id == tagID) {
                                index = i;
                                break;
                            }
                        }
                        if (index == -1) {
                            return;
                        }

                        // Return a tag to unusedTags
                        this.unusedTags.push(this.pickedTags[index]);
                        // Remove an element
                        this.pickedTags.splice(index, 1);
                    }
                }
            };
        },
        settings: function() {
            return {
                // TODO: event bue
                // tags: () => modalWindow.showWindow().globalTagsUpdating(),
                logout: () => {
                    if (!confirm("Are you sure you want log out?")) {
                        return;
                    }

                    fetch("/logout", {
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

<style>
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
    justify-content: space-between;
}

#search__tags {
    display: flex;
    height: 25px;
    margin-bottom: auto;
    margin-right: 5px;
    margin-top: auto;
    padding: 5px;
    position: relative;
}

#unpicked-tags {
    background-color: var(--secondary-color);
    border: 1px solid var(--primary-border-color);
    border-radius: 5px;
    display: flex;
    flex-wrap: wrap;
    min-height: 20px;
    padding: 5px;
    position: absolute;
    top: 35px;
    width: 400px;
}

.suggestion-tag {
    border-radius: 5px;
    cursor: pointer;
    padding: 4px;
}

.suggestion-tag:hover {
    background-color: var(--secondary-element-color);
}

#advanced-menu {
    display: flex;
    height: 25px;
    margin-top: auto;
    margin-bottom: auto;
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
