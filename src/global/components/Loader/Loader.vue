<template>
	<img
		:src="source"
		:style="style"
	>
</template>

<script lang="ts">
import Vue from "vue";

const LoaderGIF = "/static/icons/loader.svg";

const ResetTimeout = 50; // ms

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
                    "max-width": "200px",
                    "border-radius": "20px"
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
            // Reset with timeout. It prevents image flicker
            let timeoutID = setTimeout(() => {
                // Reset, if image wasn't loaded
                this.isLoaded = false;
                this.isError = false;
            }, ResetTimeout);

            // Create a new Image with passed src
            let img = new Image();
            img.onload = () => {
                clearTimeout(timeoutID);
                this.isLoaded = true;
            };
            img.onerror = () => {
                clearTimeout(timeoutID);
                this.isError = true;
            };
            img.src = this.src;
        }
    }
});
</script>
