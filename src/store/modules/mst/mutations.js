import initialState from './state'
import {cloneDeep} from "lodash"

export default {
    SET_STEP_STATUS(state, payload) {
        state.steps[payload.step ?? state.currentStep].status = payload.status
    },
    SET_STEP_DATA(state, payload) {
        state.steps[payload.step ?? state.currentStep].data = cloneDeep(payload.data)
    },
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