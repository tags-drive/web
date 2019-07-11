<template>
	<div id="tags-list">
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
			<input class="btn" type="button" value="Change tags" @click="updateTags">
		</div>
	</div>
</template>


<style lang="scss" scoped>
#tags-list {
    width: 400px;

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
        file: File
    },
    data: function() {
        return {
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

            // Select tags
            for (let j = 0; j < this.groups[i].tags.length; j++) {
                let id = this.groups[i].tags[j].id;
                if (this.file.tags.includes(id)) {
                    this.groups[i].tags[j].selected = true;
                }
            }
        }
    },
    //
    methods: {
        updateTags() {
            let tagsIDs: number[] = [];

            this.groups.forEach(gr => {
                gr.tags.filter(tag => tag.selected).forEach(tag => tagsIDs.push(tag.id));
            });

            API.files.changeTags(this.file.id, tagsIDs);
            this.hideWindow();
        },
        hideWindow() {
            EventBus.$emit(Events.ModalWindow.HideWindow);
        }
    }
});
</script>
