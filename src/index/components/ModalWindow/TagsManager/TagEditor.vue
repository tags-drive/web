<template>
	<div class="container">
		<!-- Tag preview -->
		<div id="tag-preview" style="display: flex;">
			<!-- Indicator -->
			<div
				id="tag-indicator"
				class="vertically"
				:style="{'border-left-color': indicatorBorderColor}"
			></div>

			<tag :tag="{ name: newName, color: newColor }"></tag>
		</div>

		<!-- Fields to edit -->
		<div id="edit-fields">
			<!-- Tag name -->
			<div id="name">
				<input
					type="text"
					@input="check"
					:disabled="isDeleted"
					v-model="newName">
			</div>

			<!-- Tag color -->
			<div id="color">
				<input
					type="text"
					style="margin-right: 5px;"
					@input="check"
					:disabled="isDeleted"
					v-model="newColor">

				<!-- Generate color -->
				<i
					id="generate-button"
					class="material-icons btn noselect"
					title="Generate a new color"
					@click="generateRandomColor"
					:style="[isDeleted ? {'opacity': '0.3', 'background-color': 'white', 'cursor': 'default'} : {'opacity': '1'}]">cached</i>
			</div>

			<!-- Tag group -->
			<div>
				<input
					type="text"
					placeholder="Group"
					:disabled="isDeleted"
					@input="check"
					v-model="newGroup">
			</div>
		</div>

		<!-- Buttons -->
		<div id="manage-buttons" style="display: flex;">
			<!-- Reset -->
			<i
				class="material-icons btn noselect"
				title="Reset"
				@click="reset"
				:style="resetButtonStyle"
			>refresh</i>

			<!-- Save -->
			<i
				class="material-icons btn noselect"
				title="Save"
				@click="save"
				:style="saveButtonStyle"
			>done</i>

			<!-- Delete or recover -->
			<i
				v-if="!isDeleted || isNewTag"
				class="material-icons btn noselect"
				title="Delete"
				@click="del"
				:style="[isNewTag ? {'opacity': '0.3', 'background-color': 'white', 'cursor': 'default'} : {'opacity': '1'}]"
			>delete</i>
			<i
				v-else
				class="material-icons btn noselect"
				title="Undo"
				@click="recover"
			>undo</i>
		</div>
	</div>
</template>


<style lang="scss" scoped>
.container {
    column-gap: 25px;
    display: grid;
    grid-template-columns: auto 400px 80px;
    margin-bottom: 5px;

    > #tag-preview {
        > #tag-indicator {
            border-left: 2px solid white;
            margin-right: 2px;
            height: 20px;
        }
    }

    > #edit-fields {
        column-gap: 15px;
        display: grid;
        grid-template-columns: auto 100px 100px;

        input {
            height: 70%;
            margin: auto;
            width: 100%;
        }

        > div {
            display: contents;
        }

        > #color {
            column-gap: 5px;
            display: grid;
            grid-template-columns: auto 20px;

            > #generate-button {
                font-size: 20px;
                height: 20px;
                margin: auto;
                width: 20px;
            }
        }
    }

    > #manage-buttons {
        i {
            font-size: 20px;
            height: 20px;
            margin: auto;
            width: 20px;

            &:last-child {
                margin-right: 0;
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { Tag } from "@app/global/classes";

const validColor = /^#[\dabcdef]{6}$/;

export default Vue.extend({
    components: {
        tag: TagComponent
    },
    //
    props: {
        tag: Tag,
        tagID: Number,
        isNewTag: Boolean // only new tag
    },
    data: function() {
        return {
            newName: "",
            newColor: "",
            newGroup: "",
            //
            isChanged: false, // isNewTag wasn't passed,
            isError: false,
            isDeleted: false
        };
    },
    computed: {
        indicatorBorderColor: function(): string {
            if (this.isDeleted) {
                return "white";
            }
            if (this.isError) {
                return "red";
            }
            if (this.isChanged) {
                return "blue";
            }

            return "white";
        },
        saveButtonStyle: function(): any {
            if (this.isError || this.isDeleted || !this.isChanged) {
                return { opacity: "0.3", "background-color": "white", cursor: "default" };
            }
            return { opacity: "1" };
        },
        resetButtonStyle: function(): any {
            if ((!this.isChanged && !this.isDeleted) || this.isNewTag) {
                return { opacity: "0.3", "background-color": "white", cursor: "default" };
            }
            return { opacity: "1" };
        }
    },
    //
    created: function() {
        this.isChanged = this.isNewTag !== true ? false : true;

        if (this.isNewTag && this.tag === undefined) {
            this.newName = "new tag";
            this.newColor = "#ffffff";
            this.newGroup = "";
        } else {
            this.newName = this.tag.name;
            this.newColor = this.tag.color;
            this.newGroup = this.tag.group;
        }
    },
    destroyed: function() {
        // Called, when window is closed
        // We delete a tag only after closing the window
        // It lets us to undo the file deleting
        if (this.isDeleted) {
            this.$parent.$emit("delete-tag", { tagID: this.tagID });
        }
    },
    //
    methods: {
        check() {
            if (
                !this.isNewTag &&
                this.tag.name === this.newName &&
                this.tag.color === this.newColor &&
                this.tag.group === this.newGroup
            ) {
                // Can skip, if name and color weren't changed
                this.isChanged = false;
                this.isError = false;
                return;
            }
            this.isChanged = true;

            if (this.newName.length === 0) {
                this.isError = true;
                return;
            }
            if (validColor.exec(this.newColor) === null) {
                this.isError = true;
                return;
            }

            this.isError = false;
        },
        generateRandomColor() {
            if (this.isDeleted) {
                return;
            }

            let getHexRandom = (max: number): string => {
                let res = Math.floor(Math.random() * max).toString(16);
                if (res.length === 1) {
                    res = "0" + res;
                }

                return res;
            };

            this.isChanged = true;
            this.isError = false; // we can't generate an invalid color
            this.newColor = "#" + getHexRandom(256) + getHexRandom(256) + getHexRandom(256);
        },
        reset() {
            if (this.isDeleted || this.isNewTag) {
                return;
            }

            this.newName = this.tag.name;
            this.newColor = this.tag.color;
            this.newGroup = this.tag.group;

            this.isError = false;
            this.isChanged = false;
        },
        // API
        save() {
            if (this.isError || !this.isChanged) {
                return;
            }

            if (this.isNewTag) {
                // Need to create, not to change
                this.$parent.$emit("add-tag", { name: this.newName, color: this.newColor, group: this.newGroup });
                // Reset vars
                this.newName = "new tag";
                this.newColor = "#ffffff";
            } else {
                this.$parent.$emit("change-tag", {
                    tagID: this.tagID,
                    newName: this.newName,
                    newColor: this.newColor,
                    newGroup: this.newGroup
                });
                this.isChanged = false;
            }
        },
        del() {
            if (!this.isNewTag) {
                this.isDeleted = true;
            }
        },
        recover() {
            if (!this.isNewTag) {
                this.isDeleted = false;
            }
        }
    }
});
</script>
