<template>
	<div
		id="preview-window"
		@click.self="window().hide()"
		v-if="show"
		@keydown.right="nextPreview"
		@keydown.left="previousPreview"
	>
		<!-- TODO -->
		<!-- Title -->
		<div
			v-if="isTextFile()"
			id="text-preview"
		>
			<pre>{{textFileContent}}</pre>
		</div>
		<div
			v-else-if="isImage()"
			id="image-preview"
		>
			<img :src="Params.Host + '/' + file.origin">
		</div>
		<div
			v-else
			style="text-align: center;"
		>
			<h2>Preview for this file is unsupported</h2>
		</div>
	</div>
</template>


<style le scoped>
#preview-window {
    background-color: #00000070;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 5;
}

#text-preview,
#image-preview {
    position: relative;
    top: 10%;
    width: 80%;
    height: 80%;
    margin: auto;
}

#text-preview {
    background-color: white;
    padding: 5px;
}

#text-preview > pre {
    margin: 0;
    padding: 10px;
}

#image-preview > img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-height: 100%;
    max-width: 100%;
    height: auto;
    width: auto;
}
</style>

<script>
let lastWindowOnkeydownHandler;

export default {
    data: function() {
        return {
            show: false,
            // File
            fileIndex: 0,
            file: Object,
            // Data
            textFileContent: ""
        };
    },
    methods: {
        window: function() {
            return {
                show: () => {
                    this.SharedState.commit("hideDropLayer");

                    lastWindowOnkeydownHandler = window.onkeydown;
                    window.onkeydown = event => {
                        switch (event.key) {
                            case "ArrowRight":
                                this.nextPreview();
                                break;
                            case "ArrowLeft":
                                this.previousPreview();
                                break;
                        }
                    };

                    this.show = true;
                },
                hide: () => {
                    this.SharedState.commit("showDropLayer");

                    window.onkeydown = lastWindowOnkeydownHandler;
                    this.show = false;
                }
            };
        },
        isTextFile: function() {
            let ext = this.file.filename.split(".").pop();
            return ext == "txt";
        },
        isImage: function() {
            return this.file.type == "image";
            // return ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif";
        },
        nextPreview: function() {
            if (this.fileIndex < this.SharedStore.state.allFiles.length - 1) {
                this.file = this.SharedStore.state.allFiles[++this.fileIndex];

                if (this.isTextFile()) {
                    fetch(this.Params.Host + "/" + this.file.origin, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(resp => resp.text())
                        .then(text => (this.textFileContent = text))
                        .catch(err => this.logError(err));
                }
            }
        },
        previousPreview: function() {
            if (this.fileIndex > 0) {
                this.file = this.SharedStore.state.allFiles[--this.fileIndex];

                if (this.isTextFile()) {
                    fetch(this.Params.Host + "/" + this.file.origin, {
                        method: "GET",
                        credentials: "same-origin"
                    })
                        .then(resp => resp.text())
                        .then(text => (this.textFileContent = text))
                        .catch(err => this.logError(err));
                }
            }
        }
    }
};
</script>
