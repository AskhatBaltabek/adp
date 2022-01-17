import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import vueNumeralFilterInstaller from 'vue-numeral-filter'
import mutations from './mutations'
import getters from './getters'
import actions from './actions'
import newsModule from './modules/news'
import kaskoModule from './modules/kasko'
import ogpoModule from './modules/ogpo'
import mstModule from './modules/mst'
import usersModule from './modules/users'
import autoshopModule from './modules/autoshop'

Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' });
Vue.use(Vuex);
const debug = true;

export default new Vuex.Store({
    modules: {
        news: newsModule,
        kasko: kaskoModule,
        ogpo: ogpoModule,
        mst: mstModule,
        users: usersModule,
        autoshop: autoshopModule
    },
    state() {
        return {
            spinning: false,
            accessToken: localStorage.getItem('user-token') || "",
            user: JSON.parse(localStorage.getItem('user-data'))
        };
    },
    mutations,
    getters,
    actions,
    strict: debug,
    plugins: debug ? [createLogger()] : [] // set logger only for development
});
