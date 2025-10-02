import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@mdi/font/css/materialdesignicons.css'
import './assets/styles/main.scss'

const app = createApp(App)

// Configuración Moderna de Toast
const toastOptions = {
  position: "top-right",
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__fade",
  maxToasts: 5,
  newestOnTop: true,
  filterBeforeCreate: (toast, toasts) => {
    // Evitar duplicados de toasts
    if (toasts.filter(t => t.content === toast.content).length !== 0) {
      return false
    }
    return toast
  },
  toastClassName: "modern-toast",
  bodyClassName: "modern-toast-body"
}

app.use(router)
app.use(store)
app.use(vuetify)
app.use(Toast, toastOptions)

app.mount('#app')