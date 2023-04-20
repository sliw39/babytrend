import { createApp } from 'vue'
import './style.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'
import { createVuetify } from 'vuetify/lib/framework.mjs'
import { createRouter, createWebHashHistory } from 'vue-router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

createApp(App).use(createRouter({routes: [
    {path: '/survey/:surveyId', component: () => import('./components/Survey.vue'), props: true},
    {path: '/survey', component: () => import('./components/Survey.vue')},
    {path: '/', component: () => import('./components/Dashboard.vue')},
    {path: '/weight', component: () => import('./components/WeightChart.vue')},
    {path: '/meals', component: () => import('./components/Meals.vue')},
], history: createWebHashHistory()})).use(createVuetify({
    components: {...components, VDataTableServer},
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    },
})).mount('#vue3-app')
