<template>
	<tr
		:style="[hover || selected ? {'background-color': 'rgba(0, 0, 0, 0.1)'} : {'background-color': 'white'} ]"
		@mouseover="hover = true;"
		@mouseleave="hover = false;"
		@click.right.prevent="showContextMenu($event, file);"
	>
		<td style="text-align: center;">
			<input
				type="checkbox"
				style="height: 15px; width: 15px;"
				v-model="selected"
				@change="toggleSelect">
		</td>
		<td
			v-if="file.type == 'image'"
			title="Show preview"
			style="width: 50px; text-align: center; cursor: pointer;"
			@click="showPreview"
		>
			<img
				style="display: inline-block; height: auto; max-height: 100%; max-width: 100%; width: auto;"	
				:src="Params.Host + '/' + file.preview">
		</td>
		<td
			v-else
			style="width: 50px; text-align: center; cursor: pointer;"
			title="Show preview"
			@click="showPreview"
		>
			<img
				style="width: 30px; cursor: pointer;"
				:src="Params.Host + '/ext/' + file.filename.split('.').pop()">
		</td>	
		<td>
			<div class="filename" :title="file.filename">
				{{file.filename}}
			</div>
		</td>
		<td>
			<div style="display: flex; flex-wrap: wrap;">
				<div
					class="tag"
					style="margin-top: 3px; margin-bottom: 3px;"
					v-for="(id, index) in file.tags"
					:key="index"
					:style="{ 'background-color': allTags[id].color == undefined ? 'white' : allTags[id].color }"
				>
					<div>{{allTags[id].name}}</div>
				</div>
			</div>
		</td>
		<td :title="file.description">
			{{
				// Cut too long description
				(file.description.length > 20) ? file.description.slice(0, 20) + '...' : file.description
			}}
		</td>
		<td>{{(file.size / (1024 * 1024)).toFixed(1)}}</td>
		<td>{{file.addTime}}</td>
	</tr>
</template>

<script>
import { Events, EventBus } from "../eventBus";

export default {
    props: {
        file: Object,
        allTags: Object
    },
    data: function() {
        return {
            hover: false,
            selected: false,
        };
    },
    methods: {
        showContextMenu: function(event) {
            EventBus.$emit(Events.ShowContextMenu, { file: this.file, x: event.x, y: event.y });
        },
        toggleSelect: function() {
            // We can skip changing this.selected, because a checkbox is bound to this.selected

            // The function is called after changing this.selected
            if (this.selected) {
                this.$parent.selectFile();
            } else {
                this.$parent.unselectFile();
            }
        },
        /* For the parent */
        select: function() {
            this.selected = true;
        },
        unselect: function() {
            this.selected = false;
        },
        showPreview: function() {
            EventBus.$emit(Events.ShowPreview, { file: this.file });
        }
    }
};
</script>
