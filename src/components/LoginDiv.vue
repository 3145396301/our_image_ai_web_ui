<template>
  <div class="login-component">
    <div id="bg">
      <canvas></canvas>
      <canvas></canvas>
      <canvas></canvas>
    </div>
    <XyzTransition xyz="fade in-right-100% in-up-100% out-up-100% out-left-100%">
      <div class="loginForm" v-if="isLogin">
        <h1>Effect Login Form</h1>
        <div class="sub-main-w3" :style="{margin: 'auto',width: '800px',}">
          <form @submit.prevent="login" class="form">
            <h2>Login Now <i class="fas fa-level-down-alt"></i></h2>
            <div class="form-style-agile">
              <label>
                <i class="fas fa-user"></i>
                用户名
              </label>
              <input v-model="user.username" placeholder="Username" name="Name" type="text" required>
            </div>
            <div class="form-style-agile">
              <label>
                <i class="fas fa-unlock-alt"></i>
                密码
              </label>
              <input v-model="user.password" placeholder="Password" name="Password" type="password" required>
            </div>
            <div class="wthree-text">
              <ul>
                <li>
                  <div style="text-align: left">
                    <label class="anim">
                      <input type="checkbox" class="checkbox" v-model="user.staySignedIn">
                      <span>记住我</span>
                    </label>
                    <br>
                    <label class="anim">
                      <input type="checkbox" class="checkbox" v-model="agreeToTheUserAgreement" required>
                      <span>我同意<a href="#">用户协议</a></span>
                    </label>
                  </div>
                </li>
                <li>
                  <a href="#">忘记密码</a>
                </li>
              </ul>
            </div>

            <XyzTransition xyz="fade flip-down-100% flip-right-100% rotate-left-100% left-100%">
              <CaptchaDiv class="square" :user-form="user" :is-login="isLogin" :logined="logined"
                          v-if="captchaWindow"></CaptchaDiv>
            </XyzTransition>
            <XyzTransition xyz="fade in-up-100% in-back-5">
              <input v-if="!captchaWindow" type="submit" value="Log In">
            </XyzTransition>
            <div class="cutover" @click="cutover">+</div>
          </form>
        </div>

      </div >
    </XyzTransition>
    <XyzTransition xyz="fade in-left-100% in-up-100% out-right-100% out-up-100%">
      <div class="signInForm" v-if="!isLogin">
        <h1>registered Form</h1>
        <div class="sub-main-w3" :style="{margin: 'auto',width: '800px',}">
          <form @submit.prevent="login" class="form">
            <h2>registered Now <i class="fas fa-level-down-alt"></i></h2>
            <div class="form-style-agile">
              <label>
                <i class="fas fa-user"></i>
                用户名
              </label>
              <input v-model="user.username" placeholder="Username" name="Name" type="text" required>
            </div>
            <div class="form-style-agile">
              <label>
                <i class="fas fa-unlock-alt"></i>
                密码
              </label>
              <input v-model="user.password" placeholder="Password" name="Password" type="password" required>
            </div>
            <div class="form-style-agile">
              <label>
                <i class="fas fa-unlock-alt"></i>
                确认密码
              </label>
              <input v-model="confirmYourPassword" placeholder="Password" name="Password" type="password" required>
            </div>
            <div class="wthree-text">
              <ul>
                <li>
                  <div style="text-align: left">
                    <label class="anim">
                      <input type="checkbox" class="checkbox" v-model="agreeToTheUserAgreement" required>
                      <span>我同意<a href="#">用户协议</a></span>
                    </label>
                  </div>
                </li>
                <li>
                  <a href="#">忘记密码</a>
                </li>
              </ul>
            </div>
            <XyzTransition xyz="fade flip-down-100% flip-right-100% rotate-left-100% left-100%">
              <CaptchaDiv class="square" :user-form="user" :is-login="isLogin" :logined="logined"
                          v-if="captchaWindow"></CaptchaDiv>
            </XyzTransition>
            <XyzTransition xyz="fade in-up-100% in-back-5">
              <input v-if="!captchaWindow" type="submit" value="registered">
            </XyzTransition>
            <div class="cutover" @click="cutover">-</div>
          </form>
        </div>
      </div>
    </XyzTransition>

    <div class="footer">
      <p>&copy; 2018.Company name All rights reserved.</p>
    </div>
  </div>
</template>

<script>

import './../css/style.css'
import './../css/fontawesome-all.css'
import {init} from "@/l";
import jQuery from 'jquery'
import CaptchaDiv from "@/components/CaptchaDiv.vue";
import '@/css/tac.css'

export default {
  components: {
    CaptchaDiv
  },
  data() {
    return {
      user: {
        username: '',
        password: '',
        staySignedIn: false,
      },
      confirmYourPassword: '',
      captchaWindow: false,
      agreeToTheUserAgreement: false,
      isLogin: true
    };
  },
  mounted() {
    this.runCanvasAnimation();
  },
  methods: {
    login() {
      if (this.agreeToTheUserAgreement){
        this.captchaWindow = true;
      }else {
        alert('请同意用户协议');
      }
    },
    runCanvasAnimation() {
      init(jQuery)
    },
    logined(res) {
      this.captchaWindow = false;
      res.data.respCode === 1 ? alert('登录成功') : alert('登录失败');
    },
    cutover() {
      this.isLogin = !this.isLogin;
      this.user = {
        username: '',
        password: '',
        staySignedIn: false,
      };
      this.confirmYourPassword = '';
      this.agreeToTheUserAgreement = false;

    }
  },
  computed: {
    confirmCorrect() {
      return this.confirmYourPassword === this.user.password;
    }
  }
};
</script>

<!-- Add your styles here -->
<style scoped>
.sub-main-w3 {
  background: rgba(10, 10, 10, 0.17);
}

.cutover {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 30px;
  color: white;
  cursor: pointer;
  width: 50px;
  height: 50px;
  line-height: 47px;
  text-align: center;
  border-radius: 50%;
  background-color: #a9ffe5;
  user-select: none;

}
.loginForm{
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.signInForm{
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.login-component{
  text-align: center;
  position: relative;
}
.form {
  position: relative;
}
.footer{
  position: absolute;
  top: 900px;
  width: 100%;
  color: white;
  padding: 10px;
}
</style>