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
import UrlObj from "@/urlObj";
const host = 'http://127.0.0.1:8000';
export default {
  name: 'CaptchaComponent', // 组件名称
  methods: {
    openCaptcha(type) {
      this.config.requestCaptchaDataUrl = host+`/gen?type=${type}`;
      new this.TAC(this.config, this.style).init();
    }
  },
  data() {
    return {
      config: {
        requestCaptchaDataUrl: UrlObj.user.genVerificationCode+"?type=ROTATE",
        validCaptchaUrl: UrlObj.user.checkVerificationCode,
        bindEl: "#captcha-box",
        validSuccess: (res, c, tac) => {
          this.$emit("success", res.data.id);
          this.$emit("close");
        },
        // 关闭按钮回调事件
        btnCloseFun: (el, tac) => {
          this.$emit("close");
          this.$notify.info("触发关闭")
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