<template>
	<div id="login-form">
		<!-- Error -->
		<div
			v-if="isError"
			id="error-msg"
			class="container"
			style="height: auto;"
		>
			<svg style="width: 24px; height: 30px;" viewBox="0 0 24 24">
				<path fill="#ffffff" d="M11,4.5H13V15.5H11V4.5M13,17.5V19.5H11V17.5H13Z" />
			</svg>
			<span>{{errorMsg}}</span>
		</div>

		<!-- Login -->
		<div id="login" class="container">
			<input
				type="text"
				placeholder="Login"
				v-model="login"
				@keypress.enter="auth">
		</div>

		<!-- Password -->
		<div id="password" class="container">
			<input
				:type="[showPassword ? 'text' : 'password']"
				placeholder="Password"
				v-model="password"
				@keypress.enter="auth">

			<div
				id="visibility-switch-wrapper"
				:title="!showPassword ? 'Show password' : 'Hide password'"
				@click="showPassword = !showPassword"
			>
				<svg
					v-if="showPassword"
					viewBox="0 0 24 24"
				>
					<path fill="#000000" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z"/>
				</svg>
				<svg
					v-else
					viewBox="0 0 24 24"
				>
					<path fill="#000000" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
				</svg>
			</div>
		</div>

		<!-- Submit -->
		<div id="submit-button" class="container">
			<input
				type="button"
				value="Submit"
				@click="auth">
		</div>
	</div>
</template>


<style lang="scss" scoped>
* {
    font-family: arial, sans-serif;
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
    transform: translateX(-50%);
    width: 80%;

    input {
        font-size: 16px;
        width: 100%;

        &[type="text"],
        &[type="password"] {
            border: none;
            border-bottom: 1px solid #88888888;
            outline: none;
        }
    }

    > .container {
        height: 25px;
        margin: 0 auto 12px;
        position: relative;
        width: 80%;

        &:last-child {
            margin-bottom: 0px;
        }
    }

    > #error-msg {
        background-color: #ff6253;
        border-radius: 10px;
        color: white;
        display: flex;
        justify-content: center;
        height: fit-content;
        line-height: 30px;
        min-height: 30px;
        position: relative;

        > svg {
            position: absolute;
            left: 10px;
        }

        > span {
            max-width: 80%;
        }
    }

    > #password {
        > #visibility-switch-wrapper {
            bottom: 0px;
            cursor: pointer;
            position: absolute;
            right: 1px;

            > svg {
                height: 24px;
                width: 24px;
            }
        }
    }

    > #submit-button {
        > input {
            background-color: #88888840;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            height: 30px;
            width: 120px;

            &:hover {
                background-color: #88888860;
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Other
import { sha256 } from "js-sha256";
import { Params } from "@app/global";

export default Vue.extend({
    data: function() {
        return {
            login: "",
            password: "",
            errorMsg: "",
            // flags
            showPassword: false,
            isError: false
        };
    },
    //
    methods: {
        fail: function(error: string) {
            setTimeout(() => {
                this.errorMsg = error;
                this.isError = true;
                this.password = "";
            }, 300);
        },
        auth: function() {
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
});
</script>
