import axios from 'axios'
import store from '../store/index';

const apiClient = axios.create({
    // baseURL: 'https://my-json-server.typicode.com/bipinstha7/vue-design-pattern',
    baseUrl: 'http://localhost:3000',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 120000 // throw error if API call takes longer than 60 seconds
})

const getAuthToken = () => 'Bearer '+localStorage.getItem('user-token')

const interceptor = (config) => {
    config.headers['Authorization'] = getAuthToken()
    return config
}

apiClient.interceptors.request.use(
    interceptor,
    async error => {
        return Promise.reject(error)
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async error => {
        const originalConfig = error.config
        if (error.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true
            // eslint-disable-next-line no-unused-vars
            const resp = await store.dispatch('REFRESH_TOKEN')
            return apiClient(originalConfig)
        }
        else if(error.response.status === 401 && originalConfig._retry) {
            await store.dispatch('LOGOUT')
            window.location.replace('login')
            return Promise.reject(error)
        }
        else {
            return Promise.reject(error)
        }
    }
)

export default apiClient