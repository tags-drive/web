import Vue from "vue";
// Components
import LoginForm from "@app/login/LoginForm.vue";

new Vue({
    el: "#login-form",
    render: h => h(LoginForm)
});
