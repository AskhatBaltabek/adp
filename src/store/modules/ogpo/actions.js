import apiClient from '@/services/ClientService'
import qs from 'qs'

function formErrorObject(rp) {
    return {
        success: false,
        message: rp.data.message,
        dialog: rp.status === 500 ? '$error' : '$warning',
    };
}

export default {
    async changeHolder({ dispatch, commit, getters, state }, payload) {
        let holder = payload.verified ? { ...getters.getHolder } : { ...state.client };

        for (const prop in holder) {
            if (payload.holder[prop] !== undefined) {
                if (prop === 'activity_kind_id' && !+payload.holder.natural_person_bool) {
                    await dispatch('getActivityKind', payload.holder[prop]);
                    holder[prop] = '' + payload.holder[prop];
                } else {
                    holder[prop] = payload.holder[prop];
                }
            }
        }

        if (payload.holder.esbd_id) {
            holder.id = payload.holder.esbd_id;
        }

        commit('SET_HOLDER', holder);
    },

    copyHolderToInsured({ commit, getters, state }, isInsured) {
        let insured = isInsured ? { ...getters.getHolder } : { ...state.client };
        let title = isInsured ? `${insured.last_name} ${insured.first_name}` : 'Новый';

        commit('SET_INSURED_PANE', {
            title,
            insured,
            verified: false
        });
    },

    changeInsuredPane({ commit, getters, state }, payload) {
        let insured = payload.verified ? { ...getters.getActiveInsuredPane.insured } : { ...state.client };

        for (const prop in insured) {
            if (payload.insured[prop] !== undefined) {
                insured[prop] = payload.insured[prop];
            }
        }

        if (payload.insured.esbd_id) {
            insured.id = payload.insured.esbd_id;
        }

        commit('SET_INSURED_PANE', {
            title: insured.last_name && insured.first_name ? `${insured.last_name} ${insured.first_name}` : 'Новый',
            insured,
            verified: payload.verified
        });
    },

    changeInsuredPanes({ commit, state }, payload) {
        payload.forEach((client, idx) => {
            let insured = { ...state.client };

            for (const prop in insured) {
                if (client[prop] !== undefined) {
                    insured[prop] = client[prop];
                }
            }

            if (client.esbd_id) {
                insured.id = client.esbd_id;
            }

            let title = `${insured.last_name} ${insured.first_name}`;

            if (idx === 0) {
                commit('SET_INSURED_PANE', {
                    title: title,
                    insured,
                    verified: true,
                });
            } else {
                commit('ADD_INSURED_PANE', {
                    key: Math.random().toString().substring(2, 7),
                    title: title,
                    insured,
                    verified: true
                });
            }
        });
    },

    changeVehiclePane({ commit, getters, state }, payload) {
        let vehicle = payload.verified ? { ...getters.getActiveVehiclePane.vehicle } : { ...state.vehicle };

        for (const prop in vehicle) {
            if (payload.vehicle[prop] !== undefined) {
                vehicle[prop] = payload.vehicle[prop];
            }
        }

        if (payload.vehicle.esbd_id) {
            vehicle.id = payload.vehicle.esbd_id;
        }

        commit('SET_VEHICLE_PANE', {
            title: vehicle.reg_num ? vehicle.reg_num : 'Новый',
            vehicle,
            verified: payload.verified
        });
    },

    changeVehiclePanes({ commit, state }, payload) {
        payload.forEach((vehicle, idx) => {
            let newVehicle = { ...state.vehicle };

            for (const prop in newVehicle) {
                if (vehicle[prop] !== undefined) {
                    newVehicle[prop] = vehicle[prop];
                }
            }

            if (vehicle.esbd_id) {
                newVehicle.id = vehicle.esbd_id;
            }

            if (idx === 0) {
                commit('SET_VEHICLE_PANE', {
                    title: newVehicle.reg_num,
                    vehicle: newVehicle,
                    verified: true,
                });
            } else {
                commit('ADD_VEHICLE_PANE', {
                    key: Math.random().toString().substring(2, 7),
                    title: newVehicle.reg_num,
                    vehicle: newVehicle,
                    verified: true
                });
            }
        });
    },

    changePolicy({ commit, state }, payload) {
        let policy = { ...state.policy };

        for (const prop in policy) {
            if (payload[prop] !== undefined) {
                policy[prop] = payload[prop];
            }
        }

        commit('SET_POLICY', policy);
    },

    goToPrevStep({ commit, state }) {
        commit('SET_STEP_STATUS', 'wait');
        commit('SET_STEP', state.currentStep - 1);
        commit('SET_STEP_STATUS', 'process');
    },

    goToNextStep({ commit, state }) {
        commit('SET_STEP_STATUS', 'finish');
        commit('SET_STEP', state.currentStep + 1);
        commit('SET_STEP_STATUS', 'process');
    },

    async searchClient({ dispatch, commit, state }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_CLIENT_BASE_URL}/get-client`, { params: payload });

            if (state.currentStep === 0) {
                await dispatch('changeHolder', {
                    holder: data.data,
                    verified: false
                });
            } else {
                dispatch('changeInsuredPane', {
                    insured: data.data,
                    verified: false
                });
            }

            rp = data;
        } catch (error) {
            if (state.currentStep === 0) {
                await dispatch('changeHolder', {
                    holder: payload,
                    verified: false
                });
            } else {
                dispatch('changeInsuredPane', {
                    insured: payload,
                    verified: false
                });
            }

            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async verifyClient({ dispatch, commit, state }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.post(`${process.env.VUE_APP_CLIENT_BASE_URL}/set-client`, payload);

            let client = data.data.SetClientResult;
            let verifiedClient = {
                ...payload,
                id: client.ID,
                verify_type_id: client.VERIFY_TYPE_ID,
                verified_dt: client.dtVerified ? client.dtVerified : '',
                verify_bool: client.verify_bool
            };

            if (state.currentStep === 0) {
                await dispatch('changeHolder', {
                    holder: verifiedClient,
                    verified: true
                });
            } else {
                dispatch('changeInsuredPane', {
                    insured: verifiedClient,
                    verified: true
                });
            }

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async searchVehicle({ dispatch, commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/vehicles/search`, { params: payload });

            dispatch('changeVehiclePane', {
                vehicle: {
                    ...data.data,
                    ...payload
                },
                verified: false,
            });
            rp = data;
        } catch (error) {
            dispatch('changeVehiclePane', {
                vehicle: payload,
                verified: false
            });
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async verifyVehicle({ dispatch, commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/vehicles`, payload);

            dispatch('changeVehiclePane', {
                vehicle: data.data,
                verified: true
            });
            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async getDocumentTypes({ commit, state }) {
        if (!state.documentTypes.length) {
            try {
                const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/document-types`);

                commit('SET_DOCUMENT_TYPES', data);
            } catch (error) {
                console.log(error);
            }
        }
    },

    async getCountries({ commit, state }) {
        if (!state.countries.length) {
            try {
                const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/countries`);

                commit('SET_COUNTRIES', data);
            } catch (error) {
                console.log(error);
            }
        }
    },

    async getAgeExperiences({ commit, state }) {
        if (!state.ageExperiences.length) {
            try {
                const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/age-experiences`);

                commit('SET_AGE_EXPERIENCES', data);
            } catch (error) {
                console.log(error);
            }
        }
    },

    async getRegions({ commit, state }) {
        if (!state.regions.length) {
            try {
                const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/regions`);

                commit('SET_REGIONS', data);
            } catch (error) {
                console.log(error);
            }
        }
    },

    async getVehicleTypes({ commit, state }) {
        if (!state.vehicleTypes.length) {
            try {
                const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/vehicle-types`);
                commit('SET_VEHICLE_TYPES', data);
            } catch (error) {
                console.log(error);
            }
        }
    },

    async getActivityKind({ commit }, id) {
        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/activity-kinds/id_esbd/${id}`);

            commit('SET_ACTIVITY_KINDS', [data]);
        } catch (error) {
            commit('SET_ACTIVITY_KINDS', []);
        }
    },

    async getActivityKinds({ commit }, text) {
        if (!text) {
            commit('SET_ACTIVITY_KINDS', []);
            return;
        }

        try {
            const queryParams = `where[title][operator]=like&where[title][value]='%${text}%'&limit=30`;
            const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/activity-kinds?${queryParams}`);

            commit('SET_ACTIVITY_KINDS', data);
        } catch (error) {
            commit('SET_ACTIVITY_KINDS', []);
        }
    },

    async getEconomicsSectors({ commit, state }) {
        if (!state.economicsSectors.length) {
            try {
                const { data } = await apiClient.get(`${process.env.VUE_APP_DICTIONARY_BASE_URL}/economics-sectors`);
                commit('SET_ECONOMICS_SECTORS', data);
            } catch (error) {
                console.log(error);
            }
        }
    },

    async calculateInsurancePremium({ commit, getters }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const holder = { ...getters.getHolder };

            if (holder.mobile_phone) {
                holder.mobile_phone = holder.mobile_phone.replaceAll(/\(|\)|\s/g, '');
            }

            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/premium`, {
                holder: holder,
                insured_people: getters.getInsuredPeople,
                vehicles: getters.getVehicles,
                policy: {
                    client_id: holder.id,
                    notification_type_id: holder.notification_type_id,
                    mobile_phone: holder.mobile_phone.replace('+', ''),
                    email: holder.email,
                    client_verify_type_id: holder.verify_type_id,
                    ...payload
                }
            });

            commit('SET_PERIOD_DATA', {
                ...payload,
                ...data.data
            });
            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async setPolicy({ dispatch, commit, getters }, policyId) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const holder = { ...getters.getHolder };

            if (holder.mobile_phone) {
                holder.mobile_phone = holder.mobile_phone.replaceAll(/\(|\)|\s/g, '');
            }

            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/policies`, {
                holder: holder,
                insured_people: getters.getInsuredPeople,
                vehicles: getters.getVehicles,
                policy: {
                    id: policyId,
                    client_id: holder.id,
                    notification_type_id: holder.notification_type_id,
                    mobile_phone: holder.mobile_phone.replace('+', ''),
                    email: holder.email,
                    client_verify_type_id: holder.verify_type_id,
                    ...getters.getPeriodData,
                }
            });

            dispatch('changePolicy', data.data.policy);
            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async getPdfDocument({ state }, payload) {
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/document/${state.policy.id}`, {
                params: payload
            });
            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        return rp;
    },

    async getPolicies({ commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/policies`, {
                params: payload,
                paramsSerializer: function (params) {
                    return qs.stringify(params, { encode: false })
                },
            });

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async getPolicy({ dispatch, commit }, id) {
        commit('SET_SPINNING', true, { root: true });

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/${id}`);
            const policy = data.data;

            dispatch('changePolicy', policy);
            await dispatch('changeHolder', { holder: policy.holder });
            dispatch('changeInsuredPanes', policy.insured_people);
            dispatch('changeVehiclePanes', policy.vehicles);
            commit('SET_PERIOD_DATA', {
                'date_beg': policy.started_at,
                'date_end': policy.ended_at,
                'refund_amount': policy.parent ? policy.parent.refund_amount : 0,
                'insurance_premium': policy.insurance_premium
            });

            if (policy.status === 3) {
                commit('SET_EXTRA_STEP', {
                    data: {
                        muns_policy_number: policy.muns_policy_number,
                        muns_refund_amount: policy.muns_refund_amount,
                        refund_amount: policy.refund_amount,
                        termination_reason: policy.termination_reason,
                        refund_method: policy.refund_method,
                        bank_name: policy.bank_name,
                        iban: policy.iban,
                        bin: policy.bin,
                        bik: policy.bik,
                        card_number: policy.card_number,
                        card_holder: policy.card_holder,
                    },
                    component: 'TerminationForm',
                    title: 'Расторжение полиса',
                    status: 'process',
                });
                commit('SET_STEP', 5);
                commit('SET_ALL_STEPS_STATUSES', [
                    'finish',
                    'finish',
                    'finish',
                    'finish',
                    'finish'
                ]);
            } else {
                commit('SET_STEP', 4);
                commit('SET_ALL_STEPS_STATUSES', [
                    'finish',
                    'finish',
                    'finish',
                    'finish',
                    'process'
                ]);
            }
        } catch (error) {
            console.log(error);
        }

        commit('SET_SPINNING', false, { root: true });
    },
    // eslint-disable-next-line
    async getPoliciesByClient({ commit }, payload) {
        let policies = [];

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/clients/${payload.client_id}/policies`, {
                params: payload
            });

            policies = data.data;
        } catch (error) {
            // console.log(error);
        }

        return policies;
    },
    // eslint-disable-next-line
    async getInsuranceEvents({ commit }, payload) {
        let insuranceEvents = [];

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/clients/${payload.client_id}/insurance-events`, {
                params: payload
            });

            insuranceEvents = data.data;
        } catch (error) {
            // console.log(error);
        }

        return insuranceEvents;
    },

    async rescindPolicy({ commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/rescind`, payload);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async terminatePolicy({ commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/terminate`, payload);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },
    // eslint-disable-next-line
    async determineOffshoreCountryClients({ commit }, payload) {
        let rp = {};

        try {
            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/clients/offshore`, payload);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        return rp;
    },
    // eslint-disable-next-line
    async getRefundAmount({ commit }, policyId) {
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/${policyId}/refund`);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        return rp;
    },

    async calculateUnprofitableness({ commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/clients/${payload.client_id}/unprofitableness`);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async checkIfClientIsNew({ commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/clients/is-new`, {
                params: payload
            });

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },

    async createPolicyBasedOnExisting({ commit }, payload) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.post(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/copy`, payload);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    },
    // eslint-disable-next-line
    async getPolicyForReissue({ dispatch, commit }, id) {
        commit('SET_SPINNING', true, { root: true });
        let rp = {};

        try {
            const { data } = await apiClient.get(`${process.env.VUE_APP_OGPO_BASE_URL}/policies/${id}/reissue`);
            const policy = data.data;

            await dispatch('changeHolder', { holder: policy.holder });
            dispatch('changeInsuredPanes', policy.insured_people);
            dispatch('changeVehiclePanes', policy.vehicles);

            commit('SET_STEP', 3);
            commit('SET_ALL_STEPS_STATUSES', [
                'finish',
                'finish',
                'finish',
                'process',
                'wait'
            ]);

            rp = data;
        } catch (error) {
            rp = formErrorObject(error.response);
        }

        commit('SET_SPINNING', false, { root: true });
        return rp;
    }
};
