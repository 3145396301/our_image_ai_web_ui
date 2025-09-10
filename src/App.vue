<template>
  <div>
<!--    <LoginDiv/>-->
<!--    <router-link to="/login">登录</router-link>-->
<!--    <router-link to="/ai">表单</router-link>-->
<!--    <router-link to="/history">历史</router-link>-->
    <router-view></router-view>
  </div>


</template>

<script>
import LoginDiv from "@/components/LoginDiv.vue";
import $ from 'jquery'
import AIForm from "@/components/CreatePicture/AIForm.vue";
import axios from "axios";
import urlObj from "@/urlObj";
$("body").css("background-color", "rgba(0,0,0,0)");

export default {
  name: 'App',
  components: {
  },
  created() {
    if (this.$route.path==='/'){
      axios.get(urlObj.user.getUserInfo).then((res)=>{
        if (res.data.code===200){
          this.$router.push('/ai')
        }else {
          this.$router.push('/login')
        }
      }).catch((error)=>{
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body{
  user-select: none;
  cursor: url("@/assets/鼠标指针 (1).svg") ,auto !important;
}
</style>
