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

<script>
const Colors = {
    black: { r: 0, g: 0, b: 0, bestColor: "white" },
    blue: { r: 0, g: 0, b: 255, bestColor: "white" },
    brown: { r: 165, g: 42, b: 42, bestColor: "white" },
    gray: { r: 128, g: 128, b: 128, bestColor: "white" },
    green: { r: 0, g: 128, b: 0, bestColor: "white" },
    orange: { r: 255, g: 165, b: 0, bestColor: "black" },
    red: { r: 255, g: 0, b: 0, bestColor: "white" },
    violet: { r: 255, g: 20, b: 147, bestColor: "white" }, // deep ping
    white: { r: 255, g: 255, b: 255, bestColor: "black" },
    yellow: { r: 255, g: 255, b: 0, bestColor: "black" }
};

function hexToRGB(hex) {
    let rgb = { r: 0, g: 0, b: 0 };

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result != null) {
        rgb.r = parseInt(result[1], 16);
        rgb.g = parseInt(result[2], 16);
        rgb.b = parseInt(result[3], 16);
    }

    return rgb;
}

function getBestRGBColor(bgColor) {
    let bestMatch = Colors.black;
    let minDistance;

    let r = bgColor.r - Colors.black.r,
        g = bgColor.g - Colors.black.g,
        b = bgColor.b - Colors.black.b;
    minDistance = Math.sqrt(r * r + g * g + b * b);

    for (let c in Colors) {
        r = bgColor.r - Colors[c].r;
        g = bgColor.g - Colors[c].g;
        b = bgColor.b - Colors[c].b;

        let dist = Math.sqrt(r * r + g * g + b * b);

        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = Colors[c];
        }
    }

    return bestMatch;
}

function memoizator(func) {
    let cache = {};
    return arg => {
        if (cache[arg]) {
            return cache[arg];
        } else {
            let res = func(arg);
            cache[arg] = res;
            return res;
        }
    };
}

// getBestColor -> memoizator -> arrow function -> hexToRGB, getBestRGBColor
let getBestColor = memoizator(hexColor => {
    let rgbColour = hexToRGB(hexColor);
    return getBestRGBColor(rgbColour);
});

export default {
    props: {
        tag: Object
    },
    computed: {
        nameColor: function() {
            let bestMatch = getBestColor(this.tag.color);
            return bestMatch ? bestMatch.bestColor : "white";
        }
    }
};
</script>

