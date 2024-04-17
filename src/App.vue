<template>
  <div>
    <LoginDiv/>
  </div>


</template>

<script>
import LoginDiv from "@/components/LoginDiv.vue";
import $ from 'jquery'
$("body").css("background-color", "rgba(0,0,0,0)");
export default {
  name: 'App',
  components: {
    LoginDiv
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
}
</style>
