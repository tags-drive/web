<template>
	<div
		id="preview-window"
		@click.self="window().hide()"
		v-if="show"
	>
		<!-- TODO -->
		<!-- Title -->
		<div
			v-if="isTextFile(file.filename.split('.').pop())"
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
export default {
    data: function() {
        return {
            show: true,
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
                    this.show = true;
                },
                hide: () => {
                    this.show = false;
                }
            };
        },
        isTextFile: function(ext) {
            return ext == "txt";
        },
        isImage: function() {
            return this.file.type == "image";
            // return ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif";
        }
    }
};
</script>
