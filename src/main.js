import Vue from 'vue'
import App from './App.vue'
import VueAnimXYZ from '@animxyz/vue'
import '@animxyz/core' // Import css here if you haven't elsewhere
import VueRouter from "vue-router";
import route from "@/router/route";
Vue.use(VueAnimXYZ)
Vue.config.productionTip = false
Vue.use(VueRouter)
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
import axios from "axios";
axios.defaults.transformRequest.push(function (data, headers) {
  //在localStorage中获取token
  headers.set("satoken: "+localStorage.getItem('satoken'))
  return data;
})
new Vue({
  render: h => h(App),
  router: route
}).$mount('#app')
