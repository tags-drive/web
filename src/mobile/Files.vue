<template>
<div id="wrapper">
	<div id="all-files" ref="all-files">
		<div
			v-for="(file, index) in allFiles"
			:key="index"
		>
			<file :file="file"></file>
		</div>
	</div>
</div>
</template>


<style lang="scss" scoped>
#wrapper {
    position: fixed;
    top: 41px;
    height: calc(100vh - 41px);
    width: 100%;
}

#all-files {
    overflow-y: auto;
    height: 100%;
    width: 100%;
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import { File } from "@app/global/classes";
import FileComponent from "@app/mobile/components/File.vue";
// Other
import SharedStore from "@app/mobile/store";
import { API } from "@app/mobile/api";
import { EventBus, Events } from "@app/mobile/eventBus";

export default Vue.extend({
    components: { file: FileComponent },
    //
    data: function() {
        return {
            // It is true, when we sent a request, but didn't get a response
            fetchingNextFiles: false,
            //
            Store: SharedStore.state
        };
    },
    computed: {
        allFiles: function(): Array<File> {
            let reactive = this.Store.allFilesChangesCounter;

            return this.Store.allFiles;
        }
    },
    //
    created: function() {
        let scrollListener = (ev: UIEvent) => {
            if (ev.srcElement === null) {
                return;
            }

            const elem = ev.srcElement as Element;

            let bottom = elem.scrollHeight - (elem.scrollTop + elem.clientHeight);

            if (!this.Store.allFilesFetched && !this.fetchingNextFiles && bottom <= elem.scrollHeight / 10) {
                this.fetchingNextFiles = true;

                let oldCounter = this.Store.allFilesChangesCounter;
                let func = () => {
                    if (oldCounter !== this.Store.allFilesChangesCounter || this.Store.allFilesFetched) {
                        this.fetchingNextFiles = false;
                        return;
                    }
                    setTimeout(func, 50);
                };

                EventBus.$emit(Events.fetchNextFiles);
                setTimeout(func, 50);
            }
        };

        this.$nextTick(() => {
            // Element was rendered
            let elem = document.getElementById("all-files");
            if (elem === null) {
                /* eslint-disable no-console */
                console.error("ERR: #all-files wasn't rendered");
                /* eslint-enable no-console */
                return;
            }

            elem.addEventListener("scroll", scrollListener as any);
        });

        EventBus.$on(Events.resetFilesBlockScroll, () => {
            let elem = this.$refs["all-files"] as HTMLElement;
            if (elem !== undefined) {
                elem.scrollTo(0, 0);
            }
        });
    }
});
</script>
