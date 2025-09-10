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
          <form @submit.prevent="showCaptcha" class="form">
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
                      <input type="checkbox" class="checkbox" v-model="user.rememberMe">
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
            <input style="width: 50%" type="submit" value="登 录">
            <div class="cutover" @click="cutover">+</div>
          </form>
        </div>

      </div>
    </XyzTransition>
    <XyzTransition xyz="fade in-left-100% in-up-100% out-right-100% out-up-100%">
      <div class="signInForm" v-if="!isLogin">
        <h1>registered Form</h1>
        <div class="sub-main-w3" :style="{margin: 'auto',width: '800px',}">
          <form @submit.prevent="register" class="form">
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
            <div class="form-style-agile">
              <label>
                手机号
              </label>
              <input v-model="user.phone" name="Name" type="text" placeholder="手机号" required>
            </div>
            <div class="form-style-agile">
              <input v-model="user.smsCode" name="Name" type="text" placeholder="验证码" required
                     style="width: 70%">
              <button @click="showCaptcha" style="width: 30%;height: 100%" type="button"
                      v-if="!waitingForVerificationCode">获取验证码
              </button>
              <button style="width: 30%;height: 100%" type="button" v-if="waitingForVerificationCode">{{ waitTime }}
              </button>
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
            <input type="submit" value="注 册">
            <div class="cutover" @click="cutover">-</div>
          </form>
        </div>
      </div>
    </XyzTransition>
    <div class="captcha-cover" v-if="underVerification">
      <CaptchaDiv @success="captchaSuccess" @close="closeCaptcha"></CaptchaDiv>
    </div>

    <!--    <div class="footer">-->
    <!--      <p>&copy; 2018.Company name All rights reserved.</p>-->
    <!--    </div>-->
  </div>
</template>

<script>

import './../css/style.css'
import './../css/fontawesome-all.css'
import {init} from "@/l";
import jQuery from 'jquery'
import axios from "axios";
import CaptchaDiv from "@/components/CaptchaDiv.vue";
import '@/css/tac.css'

import url from "@/urlObj";
import urlObj from "@/urlObj";

export default {
  components: {CaptchaDiv},
  data() {
    return {
      user: {
        username: '',  //zxcvbnm
        password: '',   //zxcvbnm1
        phone: '',
        smsCode: "",
        rememberMe: false,
      },
      waitingForVerificationCode: false,
      confirmYourPassword: '',
      agreeToTheUserAgreement: false,
      isLogin: true,
      waitTime: 60,
      underVerification: false,
      captchaId: ''
    };
  },
  mounted() {
    this.runCanvasAnimation();
  },
  methods: {
    login() {
      //判断是否同意用户协议
      if (this.agreeToTheUserAgreement) {
        axios.post(`${urlObj.user.login}${this.captchaId}`, this.user).then((res) => {
          // 判断是否登录成功
          if (res.data.code === 200) {
            //登录成功
            //保存token到localStorage
            localStorage.setItem('satoken', res.headers.satoken);
            //跳转到首页
            this.$router.push('/ai');
          } else {
            //登录失败
            this.$notify.error(res.data.msg);
          }
        })
      } else {
        this.$notify.warning('请同意用户协议');
      }
    },
    register() {
      //判断两次密码是否一致
      if (this.user.password === this.confirmYourPassword) {
        //判断是否同意用户协议
        if (this.agreeToTheUserAgreement) {
          //发送请求
          axios.post(urlObj.user.register, this.user).then((res) => {
            if (res.data.success == true) {
              this.$notify.success('注册成功,正在登录');
              this.login()
            } else {
              this.$notify.warning('注册失败: ' + res.data.msg)
            }
          }).catch((error) => {
            console.log(error)
          })
        } else {
          this.$notify.warning('请同意用户协议');
        }
      } else {
        this.$notify.warning('两次密码不一致');
      }
    },
    getverificationCode() {
      //判断手机号是否正确
      if (this.user.phone.length !== 11) {
        this.$notify.warning('手机号不正确');
        return;
      }
      axios.get(url.user.sendSMS + this.user.phone+"/"+this.captchaId)
          .then((res) => {
            if (res.data.code === 200) {
              this.$notify.success('验证码发送成功');
            } else if (res.data.code === 400) {
              this.$notify.warning("人机校验错误或今日已达上限")
            }
          })
          .catch((error) => {
            console.log(error)
          })
      this.waitForTheVerificationCode()
    },
    //定时60秒等待验证码发送，等待期间禁止发送验证码，并显示倒计时
    waitForTheVerificationCode() {
      this.waitingForVerificationCode = true;
      let timer = setInterval(() => {
        this.waitTime--;
        if (this.waitTime <= 0) {
          this.waitingForVerificationCode = false;
          this.waitTime = 60;
          clearInterval(timer);
        }
      }, 1000)
    },

    runCanvasAnimation() {
      init(jQuery)
    },
    logined(res) {

    },
    cutover() {
      this.isLogin = !this.isLogin;
      this.user = {
        username: '',
        password: '',
        rememberMe: false,
        phone: '',
        smsCode: "",
      };
      this.confirmYourPassword = '';
      this.agreeToTheUserAgreement = false;
    },
    showCaptcha() {
      this.underVerification = true;
    },
    closeCaptcha() {
      this.underVerification = false;
    },
    captchaSuccess(id) {
      this.captchaId = id;
      this.$notify.success("验证成功")
      if (this.isLogin){
        this.login()
      }else {
        this.getverificationCode()
      }
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

.loginForm {
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.signInForm {
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.login-component {
  text-align: center;
  position: relative;
}

.form {
  position: relative;
}

.footer {
  position: absolute;
  top: 900px;
  width: 100%;
  color: white;
  padding: 10px;
}
.captcha-cover{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

</style>