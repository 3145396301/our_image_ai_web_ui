import vueRouter from 'vue-router';
import Vue from 'vue';
import LoginDiv from "@/components/LoginDiv.vue";
import createPicture from "@/components/CreatePicture/CreatePicture.vue";
import createHistory from "@/components/CreateHistory/CreateHistory.vue";
import UserCenter from "@/components/UserCenter/UserCenter.vue";
import payPage from "@/components/PayCom/PayPage.vue";

Vue.use(vueRouter);


var router = new vueRouter({
    routes: [
        {path: '/login', component: LoginDiv, props: true,},
        {path: '/ai', component: createPicture, props: true,},
        {path: '/history', component: createHistory, props: true,},
        {path: '/user', component: UserCenter, props: true,},
        {path: '/pay', component: payPage},
    ]
})
export default router;