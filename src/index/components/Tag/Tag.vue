<template>
	<div
		class="tag noselect"
		:style="{ 'background-color': tag.color }"
	>
		<span
			:style="{'color': nameColor}"
		>{{tag.name}}</span>
	</div>
</template>

<style scoped>
.tag {
    border: 1px rgba(66, 64, 64, 0.2) solid;
    border-radius: 7px;
    cursor: default;
    display: flex;
    height: 20px;
    line-height: 20px;
    margin-right: 5px;
    padding: 2px;
    vertical-align: middle;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
// Classes and types
import { Tag } from "@app/index/global";
import { RGBColor, BestRGBColor } from "./types";

const Colors = {
    black: <BestRGBColor>{ r: 0, g: 0, b: 0, bestColor: "white" },
    blue: <BestRGBColor>{ r: 0, g: 0, b: 255, bestColor: "white" },
    brown: <BestRGBColor>{ r: 165, g: 42, b: 42, bestColor: "white" },
    gray: <BestRGBColor>{ r: 128, g: 128, b: 128, bestColor: "white" },
    green: <BestRGBColor>{ r: 0, g: 128, b: 0, bestColor: "white" },
    orange: <BestRGBColor>{ r: 255, g: 165, b: 0, bestColor: "black" },
    red: <BestRGBColor>{ r: 255, g: 0, b: 0, bestColor: "white" },
    violet: <BestRGBColor>{ r: 255, g: 20, b: 147, bestColor: "white" }, // deep ping
    white: <BestRGBColor>{ r: 255, g: 255, b: 255, bestColor: "black" },
    yellow: <BestRGBColor>{ r: 255, g: 255, b: 0, bestColor: "black" }
};

function hexToRGB(hex: string) {
    let rgb = { r: 0, g: 0, b: 0 };

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result !== null) {
        rgb.r = parseInt(result[1], 16);
        rgb.g = parseInt(result[2], 16);
        rgb.b = parseInt(result[3], 16);
    }

    return rgb;
}

function getBestRGBColor(bgColor: RGBColor): BestRGBColor {
    let bestMatch = Colors.black;
    let minDistance;

    let r = bgColor.r - Colors.black.r,
        g = bgColor.g - Colors.black.g,
        b = bgColor.b - Colors.black.b;
    minDistance = Math.sqrt(r * r + g * g + b * b);

    for (let color of Object.values(Colors)) {
        r = bgColor.r - color.r;
        g = bgColor.g - color.g;
        b = bgColor.b - color.b;

        let dist = Math.sqrt(r * r + g * g + b * b);

        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = color;
        }
    }

    return bestMatch;
}

let cache: any = {};

let getBestColor = (hexColor: string): string => {
    if (cache[hexColor]) {
        return cache[hexColor];
    } else {
        let rgbColour = hexToRGB(hexColor);
        let bestMatch = getBestRGBColor(rgbColour);

        cache[hexColor] = bestMatch.bestColor;
        return bestMatch.bestColor;
    }
};

@Component({})
export default class extends Vue {
    @Prop() tag!: Tag;

    nameColor: string = getBestColor(this.tag.color);
}
</script>

