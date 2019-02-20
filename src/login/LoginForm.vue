<template>
	<div id="login-form">
		<div v-if="isError">
			<div id="error-msg">
				<b><span style="font-size: 20px;">Error: </span></b>{{errorMsg}}
			</div>
		</div>
		<p></p>
		<input
			type="text"
			placeholder="Login"
			v-model="login"
			@keypress.enter="auth">
		<p></p>
		<input
			type="password"
			placeholder="Password"
			v-model="password"
			@keypress.enter="auth">
		<p></p>
		<input
			type="button"
			id="submit-button"
			value="Submit"
			@click="auth">
	</div>
</template>

<style scoped>
input {
    font-size: 16px;
    width: 80%;
}

input[type="text"],
input[type="password"] {
    border: none;
    border-bottom: 1px solid #88888888;
    outline: none;
}

#login-form {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 4px 10px 5px #888888a2;
	left: 50%;
    max-width: 450px;
    padding: 20px;
	position: fixed;
    text-align: center;
    top: 30px;
	transform: translateX(-50%);
    width: 80%;
}

#submit-button {
    background-color: #88888840;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    height: 30px;
    width: 120px;
}

#submit-button:hover {
    background-color: #88888860;
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
