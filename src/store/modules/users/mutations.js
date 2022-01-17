import initialState from './state'

export default {
    SET_DATA(state, data) {
        for(let prop in data) {
            state[prop] = data[prop]
        }
    },
    RESET(state) {
        const obj = initialState()

        Object.keys(obj).forEach(key => {
            state[key] = obj[key]
        });
    }
}