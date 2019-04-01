<template>
	<img
		:src="source"
		:style="style"
	>
</template>

<script lang="ts">
import Vue from "vue";

const LoaderGIF = "/static/icons/loader.gif";

const ResetTimeout = 100; // ms

export default Vue.extend({
    props: {
        src: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            isLoaded: false,
            isError: false
        };
    },
    computed: {
        source: function() {
            if (!(this.isLoaded || this.isError)) {
                return LoaderGIF;
            }

            return this.src;
        },
        style: function(): any {
            if (!this.isLoaded) {
                return {
                    "max-width": "200px"
                };
            }

            return {};
        }
    },
    //
    created: function() {
        this.load();
    },
    //
    watch: {
        src: function() {
            this.load();
        }
    },
    //
    methods: {
        load() {
            let done = false;

            // Create a new Image with passed src
            let img = new Image();
            img.onload = () => {
                done = true;
                this.isLoaded = true;
            };
            img.onerror = () => {
                done = true;
                this.isError = true;
            };
            img.src = this.src;

            // Reset with timeout. It prevents image flicker
            setTimeout(() => {
                if (!done) {
                    // Reset, if image wasn't loaded
                    this.isLoaded = false;
                    this.isError = false;
                }
            }, ResetTimeout);
        }
    }
});
</script>
