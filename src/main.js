import Vue from 'vue'
import App from './App.vue'
import VueAnimXYZ from '@animxyz/vue'
import '@animxyz/core' // Import css here if you haven't elsewhere

Vue.use(VueAnimXYZ)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
