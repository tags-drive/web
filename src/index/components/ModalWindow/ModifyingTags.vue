<template>
	<div style="display: inline-flex; margin-bottom: 5px; width: 95%;">
		<div style="width: 2px; height: 20px; margin-right: 3px;" class="vertically">
			<div v-if="isDeleted" style="height: 20px; border-left: 2px solid white;"></div>
			<div v-else-if="isError"	style="height: 20px; border-left: 2px solid red;"></div>
			<div v-else-if="isChanged" style="height: 20px; border-left: 2px solid blue;"></div>
		</div>

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
			<i
			class="material-icons btn noselect"
			style="margin-right: 5px;" 
			title="Save"
			@click="save"
			:style="[isError || isDeleted || !this.isChanged ? {'opacity': '0.3', 'background-color': 'white', 'cursor': 'default'} : {'opacity': '1'}]">done</i>

			<i
				v-if="!isDeleted"
				class="material-icons btn noselect"
				title="Delete"
				@click="del"
				:style="[isDeleted ? {'opacity': '0.3', 'background-color': 'white', 'cursor': 'default'} : {'opacity': '1'}]"
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

<script>
import TagComponent from "../Tag/Tag.vue";

const validTagName = /^[\w\d- ]{1,20}$/;
const validColor = /^#[\dabcdef]{6}$/;

export default {
    props: {
        tag: Object,
        isNewTag: Boolean // only new tag
    },
    data: function() {
        return {
            newName: this.tag.name,
            newColor: this.tag.color,
            isChanged: this.isNewTag !== true ? false : true, // isNewTag wasn't passed,
            isError: false,
            isDeleted: false
        };
    },
    components: {
        tag: TagComponent
    },
    destroyed: function() {
        // Called, when window is closed
        // We delete a tag only after closing the window
        // It lets us to undo the file deleting
        if (this.isDeleted) {
            this.$parent.deleteTag(this.tag.id);
        }
    },
    methods: {
        check: function() {
            if (this.tag.name === this.newName && this.tag.color === this.newColor && this.isNewTag !== true) {
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
        },
        generateRandomColor: function() {
            if (this.isDeleted) {
                return;
            }
            this.isChanged = true;
            this.isError = false; // we can't generate an invalid color
            this.newColor =
                "#" +
                Math.floor(Math.random() * 256).toString(16) +
                Math.floor(Math.random() * 256).toString(16) +
                Math.floor(Math.random() * 256).toString(16);
        },
        // API
        save: function() {
            if (this.isError || !this.isChanged) {
                return;
            }

            if (this.isNewTag) {
                // Need to create, not to change
                this.$parent.addTag(this.newName, this.newColor);
            } else {
                this.$parent.changeTag(this.tag.id, this.newName, this.newColor);
            }

            this.isChanged = false;
        },
        del: function() {
            if (this.isNewTag) {
                // Delete tag right now
                this.$parent.deleteNewTag();
                return;
            }

            this.isDeleted = true;
        },
        recover: function() {
            this.isDeleted = false;
        }
    }
};
</script>
