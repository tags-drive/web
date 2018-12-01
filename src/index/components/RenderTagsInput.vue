<template>
	<div style="display: flex;">
		<span v-if="elements.length == 0">Logical expression</span>
		<div
			v-for="(elem, index) in elements"
			:key="index"
			class="vertically"
		>
			<tag
				v-if="elem.type == 'tag'"
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

<script>
import TagComponent from "./Tag.vue";

export default {
    props: {
        expression: String
    },
    data: function() {
        return {
            /*
			If it's a tag:
			{
			  type: "tag",
			  tag: {
				name: "",
				colot: "",
			  }
			}

			Else:
			{
			  type="text",
			  text: ""
			}
			*/
            elements: []
        };
    },
    components: {
        tag: TagComponent
    },
    created: function() {
        let id = "";
        let text = "";

        let addTag = () => {
            let tag = this.SharedStore.state.allTags[id];
            let name = "undefined";
            let color = "white";

            if (tag !== undefined) {
                name = tag.name;
                color = tag.color;
            }

            this.elements.push({ type: "tag", tag: { name: name, color: color } });
        };
        let addText = () => {
            this.elements.push({ type: "text", text: text });
        };

        for (let i = 0; i < this.expression.length; i++) {
            if ("0" <= this.expression[i] && this.expression[i] <= "9") {
                if (text != "") {
                    // text
                    addText();
                    text = "";
                }
                id += this.expression[i];
            } else {
                if (id != "") {
                    // tag
                    addTag();
                    id = "";
                }
                text += this.expression[i];
            }
        }

        // Add last tag or text
        if (id != "") {
            addTag();
            id = "";
        } else if (text != "") {
            addText();
            text = "";
        }
    }
};
</script>
