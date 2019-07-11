<template>
	<div id="tags-list">
		<!-- Mode -->
		<div id="mode">
			<span v-if="mode === SharedModes.addMode">Add tags</span>
			<span v-else-if="mode === SharedModes.deleteMode">Delete tags</span>
		</div>

		<!-- Tags -->
		<div
			v-for="(group, i) in groups"
			:key="i"
			class="group"
		>
			<div
				class="group-name noselect"
			>
				<i class="material-icons">navigate_next</i>
				<div><span>{{ group.name }}</span></div>
			</div>

			<div
				v-for="(tag, j) in group.tags"
				:key="j"
				class="tag-wrapper"
			>
					<div class="tag">
						<tag :tag="tag" style="margin: 0;"></tag>
					</div>
					<div class="checkbox">
						<input
							type="checkbox"
							v-model="tag.selected">
					</div>
			</div>
		</div>

		<div id="update-button">
			<input class="btn" type="button" value="Submit" @click="processSelectedFiles">
		</div>
	</div>
</template>


<style lang="scss" scoped>
#tags-list {
    width: 400px;

    > #mode {
        font-size: 20px;
        margin-bottom: 10px;
    }

    > .group {
        width: 280px;
        margin: 0 auto 10px;

        > .group-name {
            display: flex;
            height: 24px;
            line-height: 24px;
            margin-bottom: 5px;
            text-align: left;
        }

        > .tag-wrapper {
            display: flex;
            margin: 0 auto 5px;
            position: relative;
            width: 250px;

            > .tag {
                width: 200px;
                display: flex;
            }

            > .checkbox {
                position: absolute;
                right: 0;

                > input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    right: 0;
                }
            }
        }
    }

    > #update-button {
        margin-top: 15px;

        // Extend global class
        > .btn {
            height: 25px;
            font-size: 15px;
            width: 100px;
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { File, Tag, Group, TagsToGroups } from "@app/global/classes";
// Shared data
import SharedStore from "@app/index/store";
// Other
import { Events, EventBus } from "@app/index/eventBus";
import { Const } from "@app/global/const";
import API from "@app/index/api";

class CustomTag extends Tag {
    selected: boolean;

    constructor(t: Tag) {
        super(t.id, t.name, t.color);

        this.selected = false;
    }
}

class CustomGroup extends Group {
    tags: CustomTag[];

    constructor(group: Group) {
        super(group.name);

        this.tags = Array(group.tags.length);
        for (let i = 0; i < group.tags.length; i++) {
            this.tags[i] = new CustomTag(group.tags[i]);
        }
    }
}

export default Vue.extend({
    components: {
        tag: TagComponent
    },
    //
    props: {
        selectedFiles: Array as () => Array<File>,
        mode: String
    },
    data: function() {
        return {
            SharedModes: Const.tagsChanging,
            groups: [] as Array<CustomGroup>
        };
    },
    //
    created: function() {
        const allTags = SharedStore.state.allTags;
        let groups = TagsToGroups(allTags);

        this.groups = Array(groups.length);
        for (let i = 0; i < groups.length; i++) {
            this.groups[i] = new CustomGroup(groups[i]);
        }
    },
    //
    methods: {
        processSelectedFiles() {
            let tagIDs: number[] = [];

            this.groups.forEach(gr => {
                gr.tags.filter(tag => tag.selected).forEach(tag => tagIDs.push(tag.id));
            });

            let fileIDs: number[] = [];
            this.selectedFiles.forEach(file => fileIDs.push(file.id));

            if (tagIDs.length === 0 || fileIDs.length === 0) {
                return;
            }

            API.files.changeFilesTags(fileIDs, tagIDs, this.mode);
            this.hideWindow();
        },
        hideWindow() {
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
