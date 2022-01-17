import apiClient from '../../../services/ClientService'
import {setFilters} from "../../../helpers/tableHelpers";

export default {
    async SEND_PASSWORD({commit}, id) {
        commit('SET_DATA', {loading: true})
        try {
            let resp = await apiClient.post(process.env.VUE_APP_AUTH_BASE_URL + '/reset-password', {id})
            return resp.data
        } catch (e) {
            throw e.response.data
        } finally {
            commit('SET_DATA', {loading: false})
        }
    },
    async LOAD_USERS({commit}, params) {
        commit('SET_DATA', {loading: true})
        try {
            let resp = await apiClient.get(process.env.VUE_APP_AUTH_BASE_URL + '/users' + setFilters(params) + '&with[]=roles&with[]=manager')
            commit('SET_DATA', {users: resp.data.data})
            commit('SET_DATA', {pagination: {pageSize: parseInt(resp.data.per_page), total: resp.data.total, current: resp.data.current_page}})
            return resp.data
        } catch(e) {
            throw e.response.data
        } finally {
            commit('SET_DATA', {loading: false})
        }
    },
    async LOAD_USER({commit}, id) {
        try {
            await commit('SET_DATA', {user: {}})
            let resp = await apiClient.get(process.env.VUE_APP_AUTH_BASE_URL + '/users/' + id)
            await commit('SET_DATA', {user: resp.data})
            return resp.data
        } catch (e) {
            throw e.response.data
        }
    },
    async LOAD_ROLES({commit}) {
        try {
            let resp = await apiClient.get(process.env.VUE_APP_AUTH_BASE_URL + '/roles')
            await commit('SET_DATA', {roles: resp.data})
            return resp.data
        } catch (e) {
            throw e.response.data
        }
    }
}
