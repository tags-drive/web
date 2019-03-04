<template>
	<div style="display: inline-flex; margin-bottom: 5px; width: 95%;">
		<div
			class="tag-indicator vertically"
			:style="{'border-left-color': indicatorBorderColor}"
		></div>

		<div style="width: 35%; display: flex;">
			<tag :tag="{ name: newName, color: newColor }"></tag>
		</div>

		<input
			type="text"
			style="width: 35%; margin-right: 10px;"
			maxlength="20"
			@input="check"
			:disabled="isDeleted"
			v-model="newName">

		<input
			type="text"
			style="width: 15%; margin-right: 5px;"
			@input="check"
			:disabled="isDeleted"
			v-model="newColor">

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
			:style="[isError || isDeleted || !this.isChanged ? {'opacity': '0.3', 'background-color': 'white', 'cursor': 'default'} : {'opacity': '1'}]">done</i>

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

.tag-indicator {
    height: 20px;
    border-left: 2px solid white;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Components
import TagComponent from "@components/Tag/Tag.vue";
// Classes and types
import { Tag } from "@app/index/global";

const validTagName = /^[\w\d- ]{1,20}$/;
const validColor = /^#[\dabcdef]{6}$/;

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    @Prop() tag!: Tag;
    @Prop() tagID!: number;
    @Prop() isNewTag!: boolean; // only new tag

    newName: string;
    newColor: string;
    isChanged: boolean; // isNewTag wasn't passed,
    isError: boolean = false;
    isDeleted: boolean = false;

    get indicatorBorderColor() {
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
    }

    constructor() {
        super();

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
    }

    destroyed() {
        // Called, when window is closed
        // We delete a tag only after closing the window
        // It lets us to undo the file deleting
        if (this.isDeleted) {
            this.$parent.$emit("delete-tag", { tagID: this.tagID });
        }
    }

    check() {
        if (!this.isNewTag && this.tag.name === this.newName && this.tag.color === this.newColor) {
            // Can skip, if name and color weren't changed
            this.isChanged = false;
            this.isError = false;
            return;
        }
        this.isChanged = true;

        if (this.newName.length === 0 || validTagName.exec(this.newName) === null) {
            this.isError = true;
            return;
        }
        if (validColor.exec(this.newColor) === null) {
            this.isError = true;
            return;
        }

        this.isError = false;
    }

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
    }

    // API
    save() {
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
    }

    del() {
        if (!this.isNewTag) {
            this.isDeleted = true;
        }
    }

    recover() {
        if (!this.isNewTag) {
            this.isDeleted = false;
        }
    }
}
</script>
