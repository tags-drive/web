import Vue from "vue";
// Components
import LoginPage from "@app/login/LoginPage.vue";
import Logo from "@app/login/Logo.vue";
import LoginForm from "@app/login/LoginForm.vue";

new Vue({
    el: "#login-page",
    render: h => h(LoginPage)
});

new Vue({
    el: "#logo",
    render: h => h(Logo)
});

new Vue({
    el: "#login-form",
    render: h => h(LoginForm)
});
