import Vue from "vue";
//
import TagsDrive from "./TagsDrive.vue";
import SearchBar from "./SearchBar.vue";
import Files from "./Files.vue";
import Preview from "./Preview.vue";

new Vue({
    el: "#tags-drive",
    render: h => h(TagsDrive)
});

new Vue({
    el: "#search-bar",
    render: h => h(SearchBar)
});

new Vue({
    el: "#all-files-list",
    render: h => h(Files)
});

new Vue({
    el: "#files-preview",
    render: h => h(Preview)
});
