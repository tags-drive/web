<template>
	<div class="container">
		<div
			class="tag-indicator vertically"
			:style="{'border-left-color': indicatorBorderColor}"
		></div>

		<div style="display: flex;">
			<tag :tag="{ name: newName, color: newColor }"></tag>
		</div>

		<!-- Tag name -->
		<input
			type="text"
			style="margin-right: 10px;"
			@input="check"
			:disabled="isDeleted"
			v-model="newName">

		<!-- Tag color -->
		<input
			type="text"
			style="margin-right: 5px;"
			@input="check"
			:disabled="isDeleted"
			v-model="newColor">

		<!-- Generate color -->
		<i
			class="material-icons btn noselect"
			style="margin-right: 10px;"
			title="Generate a new color"
			@click="generateRandomColor"
			:style="[isDeleted ? {'opacity': '0.3', 'background-color': 'white', 'cursor': 'default'} : {'opacity': '1'}]">cached</i>

		<div style="display: flex;">
			<!-- Save -->
			<i
				class="material-icons btn noselect"
				style="margin-right: 5px;" 
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
    display: grid;
    grid-template-columns: 5px auto 35% 13% 40px 60px;
    margin-bottom: 5px;
}

.tag-indicator {
    border-left: 2px solid white;
    height: 100%;
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
    props: {
        tag: Tag,
        tagID: Number,
        isNewTag: Boolean // only new tag
    },
    data: function() {
        return {
            newName: "",
            newColor: "",
            isChanged: false, // isNewTag wasn't passed,
            isError: false,
            isDeleted: false
        };
    },
    computed: {
        indicatorBorderColor: function() {
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
        saveButtonStyle: function() {
            if (this.isError || this.isDeleted || !this.isChanged) {
                return { opacity: "0.3", "background-color": "white", cursor: "default" };
            }
            return { opacity: "1" };
        }
    },
    //
    components: {
        tag: TagComponent
    },
    //
    created: function() {
        this.isChanged = this.isNewTag !== true ? false : true;

        if (this.isNewTag && this.tag === undefined) {
            this.newName = "new tag";
            this.newColor = "#ffffff";

            // We can don't init this.tag, if this.isNewTag === true
            //
            // this.tag = new Tag("new tag", "#ffffff");
        } else {
            this.newName = this.tag.name;
            this.newColor = this.tag.color;
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
        check: function() {
            if (!this.isNewTag && this.tag.name === this.newName && this.tag.color === this.newColor) {
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
        generateRandomColor: function() {
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
        // API
        save: function() {
            if (this.isError || !this.isChanged) {
                return;
            }

            if (this.isNewTag) {
                // Need to create, not to change
                this.$parent.$emit("add-tag", { name: this.newName, color: this.newColor });
                // Reset vars
                this.newName = "new tag";
                this.newColor = "#ffffff";
            } else {
                this.$parent.$emit("change-tag", { tagID: this.tagID, newName: this.newName, newColor: this.newColor });
                this.isChanged = false;
            }
        },
        del: function() {
            if (!this.isNewTag) {
                this.isDeleted = true;
            }
        },
        recover: function() {
            if (!this.isNewTag) {
                this.isDeleted = false;
            }
        }
    }
});
</script>
