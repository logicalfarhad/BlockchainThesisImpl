import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import routes from "./router/routes";
import DateTimePicker from 'vuetify-datetime-picker';
import { Plugin } from 'vue-fragment'

// configure router
const router = new VueRouter({
  // mode: 'history',
  routes,
  linkExactActiveClass: "nav-item active"
});


Vue.use(Plugin)
Vue.use(DateTimePicker);
Vue.use(VueRouter);

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
  router
}).$mount('#app')