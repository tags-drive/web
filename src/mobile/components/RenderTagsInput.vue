<template>
	<div style="display: flex; flex-wrap: wrap; min-height: inherit; height: 100%;">
		<div
			v-for="(elem, index) in elements"
			:key="index"
			class="vertically"
			style="margin-right: 2px;"
		>
			<tag
				v-if="elem.type === 'tag'"
				:tag="elem.tag"
				style="margin: 3px 0;"
			></tag>
			<span
				v-else
				style="font-size: 16px;"
			>{{elem.text}}</span>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
// Components
import TagComponent from "@app/mobile/components/Tag.vue";
// Classes and types
import { Tag } from "@app/global/classes";
// Shared data
import SharedStore from "@app/mobile/store";

class TagElement {
    type: string = "tag";

    tag: Tag;

    constructor(n: string, c: string) {
        this.tag = new Tag();
        this.tag.name = n;
        this.tag.color = c;
    }
}

class TextElement {
    type: string = "text";
    text: string;

    constructor(t: string) {
        this.text = t;
    }
}

export default Vue.extend({
    components: {
        tag: TagComponent
    },
    //
    props: {
        expression: String
    },
    data: function() {
        return {
            elements: [] as Array<TagElement | TextElement>
        };
    },
    //
    watch: {
        expression: function() {
            this.elements = [];

            let addTag = (id: number) => {
                let tag = SharedStore.state.allTags.get(id);
                let name = "undefined";
                let color = "#ffffff";

                if (tag !== undefined) {
                    name = tag.name;
                    color = tag.color;
                }

                this.elements.push(new TagElement(name, color));
            };

            let addText = (text: string) => {
                this.elements.push(new TextElement(text));
            };

            let id = "";
            let text = "";

            for (let i = 0; i < this.expression.length; i++) {
                if ("0" <= this.expression[i] && this.expression[i] <= "9") {
                    if (text !== "") {
                        // text
                        addText(text);
                        text = "";
                    }
                    id += this.expression[i];
                } else {
                    if (id !== "") {
                        // tag
                        addTag(Number(id));
                        id = "";
                    }
                    text += this.expression[i];
                }
            }

            // Add last tag or text
            if (id !== "") {
                addTag(Number(id));
                id = "";
            } else if (text !== "") {
                addText(text);
                text = "";
            }
        }
    }
});
</script>
