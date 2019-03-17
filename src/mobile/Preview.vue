<template>

</template>

<style lang="scss">
</style>

<script lang="ts">
import Vue from "vue";
// Components and classes
import { File } from "@app/global/classes";
// Other
import { Events, EventBus } from "@app/mobile/eventBus";

export default Vue.extend({
    data: function() {
        return {
            file: new File()
        };
    },
    created: function() {
        EventBus.$on(Events.showPreview, (payload: any) => {
            if (payload === undefined || !(payload.file instanceof File)) {
                return;
            }

            this.file = payload.file;
            alert(this.file.filename);
        });
    }
});
</script>
