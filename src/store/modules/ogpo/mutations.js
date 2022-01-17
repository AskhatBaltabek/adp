import initialState from './state'

export default {
    SET_HOLDER(state, data) {
        state.steps[0].data = data;
    },

    RESET_HOLDER(state, data = {}) {
        state.steps[0].data = { ...state.client,  ...data };
    },

    SET_ACTIVE_INSURED_PANE_KEY(state, paneKey) {
        state.activeInsuredPaneKey = paneKey;
    },

    SET_INSURED_PANE(state, data) {
        let idx = state.steps[1].data.findIndex(pane => pane.key === state.activeInsuredPaneKey);
        state.steps[1].data.splice(idx, 1, {
            ...data,
            key: state.activeInsuredPaneKey
        });
    },

    ADD_INSURED_PANE(state, pane) {
        state.steps[1].data.push(pane);
    },

    REMOVE_INSURED_PANE(state, targetKey) {
        let idx = state.steps[1].data.findIndex(pane => pane.key === targetKey);
        state.steps[1].data.splice(idx, 1);
    },

    SET_ACTIVE_VEHICLE_PANE_KEY(state, paneKey) {
        state.activeVehiclePaneKey = paneKey;
    },

    SET_VEHICLE_PANE(state, data) {
        let idx = state.steps[2].data.findIndex(pane => pane.key === state.activeVehiclePaneKey);
        state.steps[2].data.splice(idx, 1, {
            ...data,
            key: state.activeVehiclePaneKey
        });
    },

    ADD_VEHICLE_PANE(state, pane) {
        state.steps[2].data.push(pane);
    },

    REMOVE_VEHICLE_PANE(state, key) {
        let idx = state.steps[2].data.findIndex(pane => pane.key === key);
        state.steps[2].data.splice(idx, 1);
    },

    ADD_STEP(state, data) {
        state.steps.push(data);
    },

    SET_STEP(state, value) {
        state.currentStep = value;
    },

    SET_STEP_DATA(state, payload) {
        state.steps[payload.step].data = payload.data;
    },

    SET_ALL_STEPS_STATUSES(state, data) {
        data.forEach((status, idx) => {
            state.steps[idx].status = status;
        });
    },

    SET_STEP_STATUS(state, status) {
        state.steps[state.currentStep].status = status;
    },

    SET_EXTRA_STEP(state, data) {
        state.steps.push(data);
    },

    SET_DOCUMENT_TYPES(state, data) {
        state.documentTypes = data;
    },

    SET_COUNTRIES(state, data) {
        state.countries = data;
    },

    SET_AGE_EXPERIENCES(state, data) {
        state.ageExperiences = data;
    },

    SET_REGIONS(state, data) {
        state.regions = data;
    },

    SET_VEHICLE_TYPES(state, data) {
        state.vehicleTypes = data;
    },

    SET_ACTIVITY_KINDS(state, data) {
        state.activityKinds = data;
    },

    SET_ECONOMICS_SECTORS(state, data) {
        state.economicsSectors = data;
    },

    SET_PERIOD_DATA(state, data) {
        state.steps[3].data = data;
    },

    SET_POLICY(state, data) {
        state.policy = data;
    },

    RESET(state) {
        const obj = initialState();

        Object.keys(obj).forEach(key => {
            state[key] = obj[key];
        });
    }
};
