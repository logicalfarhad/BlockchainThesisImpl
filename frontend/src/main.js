import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import routes from "./router/routes";
import DateTimePicker from 'vuetify-datetime-picker';

// configure router
const router = new VueRouter({
  // mode: 'history',
  routes,
  linkExactActiveClass: "nav-item active"
});

Vue.use(require('vue-moment'));
Vue.use(DateTimePicker);
Vue.use(VueRouter);

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
  router
}).$mount('#app')