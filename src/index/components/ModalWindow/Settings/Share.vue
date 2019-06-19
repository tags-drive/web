<template>
	<div id="share-settings">
		<div
			v-if="tokensKeys.length === 0"
			style="margin-top: 20px;"
		>Empty</div>

		<div
			v-for="(token, i) in tokensKeys"
			:key="i"
			class="share-token"
		>
			<div class="token-info">
				<span>• </span>
				<span class="token">{{ token }}</span>
				<span> – {{ tokens.get(token).length }} files </span>
			</div>

			<div class="management noselect">
				<i
					class="material-icons button"
					title="Copy link to clipboard"
					style="font-size: 22px; margin-right: 4px;"
					@click="copyToClipboard(token)"
				>content_copy</i>

				<a :href="originLocation + '/share?shareToken=' + token" target="_blank">
					<i class="material-icons button" title="View shared files">launch</i>
				</a>

				<i
					class="material-icons button"
					title="Remove share token"
					style="font-size: 26px;"
					@click="removeToken(token)"
				>close</i>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#share-settings {
    > .share-token {
        display: flex;
        height: 23px;
        justify-content: space-between;
        line-height: 23px;
        margin-bottom: 5px;
        text-align: left;

        > .token-info {
            > .token {
                font-family: "Courier New", Courier, monospace;
                font-size: 14px;
            }
        }

        > .management {
            > a {
                text-decoration: none;
                color: black;
            }

            > i.button {
                cursor: pointer;
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
//
import API from "@app/index/api";

export default Vue.extend({
    data: function() {
        return {
            tokens: new Map() as Map<string, Array<number>>,
            tokensChangesCounter: 0
        };
    },
    computed: {
        originLocation(): string {
            return location.origin;
        },
        tokensKeys(): Array<string> {
            const reactive = this.tokensChangesCounter;

            return Array.from(this.tokens.keys());
        }
    },
    //
    created: function() {
        API.share.getTokens().then(res => {
            this.tokens = res;
            this.tokensChangesCounter++;
        });
    },
    //
    methods: {
        removeToken: function(token: string) {
            API.share.removeToken(token);

            this.tokens.delete(token);
            this.tokensChangesCounter++;
        },
        copyToClipboard: function(token: string) {
            const link = this.originLocation + "/share?shareToken=" + token;

            const elem = document.createElement("textarea");
            elem.value = link;

            // Make element invisible
            elem.setAttribute("readonly", "");
            elem.style.position = "absolute";
            elem.style.left = "-1000px";

            // Copy the link
            document.body.appendChild(elem);
            elem.select();
            document.execCommand("copy");
            document.body.removeChild(elem);
        }
    }
});
</script>
