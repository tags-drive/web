<template>
	<div style="display: flex; flex-wrap: wrap;">
		<span v-if="elements.length === 0">Logical expression</span>
		<div
			v-for="(elem, index) in elements"
			:key="index"
			class="vertically"
		>
			<tag
				v-if="elem.type === 'tag'"
				:tag="elem.tag"
				class="input-tag"
			></tag>
			<span
				v-else
				style="font-size: 18px;"
			>{{elem.text}}</span>
		</div>
	</div>
</template>

<style scoped>
.input-tag {
    font-size: 18px;
    height: 16px;
    line-height: 16px;
    margin: auto 0;
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
// Shared data
import SharedStore from "@app/index/store";

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

@Component({
    components: {
        tag: TagComponent
    }
})
export default class extends Vue {
    @Prop() expression!: string;

    elements: (TagElement | TextElement)[] = [];

    created() {
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
</script>
