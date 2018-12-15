<template>
	<div id="login-form">
		<div v-if="isError">
			<div id="error-msg">
				<b><span style="font-size: 20px;">Error: </span></b>{{errorMsg}}
			</div>
		</div>
		<p></p>
		<input type="text" v-model="login" placeholder="Login">
		<p></p>
		<input type="password" v-model="password" placeholder="Password">
		<p></p>
		<input type="button" @click="auth" value="Submit">
	</div>
</template>

<style scoped>
input {
    font-size: 16px;
    outline-color: #88888888;
    width: 70%;
}

input[type="button"] {
    background-color: #88888862;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    height: 30px;
    width: 80px;
}

input[type="button"]:hover {
    background-color: #88888888;
}

#login-form {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 10px 10px 9px #888888a2;
    margin-top: 50px;
    margin: auto;
    padding: 20px;
    text-align: center;
    width: 40%;
}

#error-msg {
    background-color: rgba(255, 161, 161, 0.883);
    border: 1.5px rgba(255, 0, 0, 0.65) solid;
    border-radius: 5px;
    height: 30px;
    line-height: 30px;
    padding: 3px;
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Other
import { sha256 } from "js-sha256";
import { Params } from "@app/global";

@Component({})
export default class extends Vue {
    login: string = "";
    password: string = "";
    isError: boolean = false;
    errorMsg: string = "";

    fail(error: string) {
        setTimeout(() => {
            this.errorMsg = error;
            this.isError = true;
            this.password = "";
        }, 300);
    }

    auth() {
        this.isError = false;

        // 11 times
        let hash = sha256(this.password);
        for (var i = 0; i < 10; i++) {
            hash = sha256(hash);
        }

        let params = new URLSearchParams();
        params.append("login", this.login);
        params.append("password", hash);

        fetch(Params.Host + "/login?" + params, {
            method: "POST",
            credentials: "same-origin"
        })
            .then(data => {
                // Valid login and password
                if (data.status === 200) {
                    window.location.href = "/";
                    return;
                }

                data.text().then(msg => this.fail(msg));
            })
            .catch(err => this.fail(err));
    }
}
</script>
