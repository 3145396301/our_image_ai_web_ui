<template>
  <div>
    <!--    <ul class="top">-->
    <!--      <li @click="openCaptcha('RANDOM')">随机</li>-->
    <!--      <li @click="openCaptcha('SLIDER')">滑块验证码</li>-->
    <!--      <li @click="openCaptcha('ROTATE')">旋转验证码</li>-->
    <!--      <li @click="openCaptcha('CONCAT')">滑动还原验证码</li>-->
    <!--      <li @click="openCaptcha('WORD_IMAGE_CLICK')">点选验证码</li>-->
    <!--    </ul>-->
    <div id="captcha-box"></div>
  </div>
</template>

<script>
import TAC from "./../tac.min";
import axios from "axios";
const host = 'https://xiaoxve.cn';
export default {
  name: 'CaptchaComponent', // 组件名称
  props: ['userForm', 'logined', 'isLogin'],
  methods: {
    login(captchaId) {
      let url = host+'/';
      if (this.isLogin) {
        url += 'login';
      } else {
        url += 'register';
      }
      axios.post(url, {
        user: {
          username: this.userForm.username,
          password: this.userForm.password
        },
        rememberMe: this.userForm.staySignedIn,
        captchaId: captchaId
      },{
        headers: {
          agreeToTheUserAgreement: true,
        }
      }).then(res => {
        this.logined(res);
      });

    },
    openCaptcha(type) {
      this.config.requestCaptchaDataUrl = host+`/gen?type=${type}`;
      new this.TAC(this.config, this.style).init();
    }
  },
  data() {
    return {
      config: {
        requestCaptchaDataUrl: host+"/gen?type=ROTATE",
        validCaptchaUrl: host+"/check",
        bindEl: "#captcha-box",
        validSuccess: (res, c, tac) => {
          // tac.destroyWindow();
          this.login(res.data.id)
        }
      },
      style : {
        // logoUrl : null
        // 按钮样式
        btnUrl: "/images/btn3.png",
        // 背景样式
        bgUrl: "/images/btn3-bg.jpg",
        // logo地址
        logoUrl: "/images/logo.png",
        // 滑动边框样式
        moveTrackMaskBgColor: "#f7b645",
        moveTrackMaskBorderColor: "#ef9c0d"
      }
    }
  },
  mounted() {
    this.TAC = TAC;
    new this.TAC(this.config, this.style).init();
    // this.openCaptcha('ROTATE')
  }
}
</script>

<style scoped>
ul li {
  list-style: none;
}

* {
  margin: 0;
  padding: 0;
}

.top {
  overflow: auto;
}

.top li:hover {
  cursor: pointer;
}

.top li {
  float: left;
  height: 40px;
  width: 120px;
  margin-right: 5px;
  line-height: 40px;
  text-align: center;
  background-color: #409eff;
  color: #fff;
  font-size: 15px;
  box-sizing: border-box;
  border: 1px solid #409eff;
}

.captcha-iframe {
  width: 300px;
  height: 320px;
  border: none;
}

.after {
  color: #88949d;
}
</style>