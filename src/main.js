// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

//Main-Methode --> hier muss eigentlich nichts weiter gemacht werden
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Axios from 'axios'
import VueSanitize from 'vue-sanitize'

const app = createApp(App)
app.config.globalProperties.$http = Axios
Axios.defaults.withCredentials = true

app.config.productionTip = true

app.use(router, VueSanitize).mount('#app')


 
