import apiClient from '@/services/ClientService'
import {cloneDeep} from "lodash"
import qs from 'qs'
import moment from 'moment/src/moment'
import {setFilters} from "../../../helpers/tableHelpers";

const DOCUMENT_TYPE_ID_PASSPORT = 2;

export default {
    async GET_TEMPLATE({commit}, params) {
        commit('SET_DATA', {loading: true})

        try {
            let resp = await apiClient.get(process.env.VUE_APP_MST_BASE_URL + '/get-template', {params});
            commit('SET_DATA', {loading: false})
            resp.data.fileName = params.policy_number + `_${params.type}.pdf`
            return resp.data;
        } catch (e) {
            commit('SET_DATA', {loading: false})
            return e.response.data
        }
    },
    async LOAD_POLICIES({commit}, params) {
        commit('SET_DATA', {loading: true})
        let resp = await apiClient.get(process.env.VUE_APP_MST_BASE_URL + '/policies/' + setFilters(params))
        commit('SET_DATA', {policies: resp.data.data})
        delete resp.data.data
        commit('SET_DATA', {pagination: resp.data})
        commit('SET_DATA', {loading: false})
    },
    async LOAD_POLICY({commit, state, dispatch}, policyId) {
        let resp = await apiClient.get(process.env.VUE_APP_MST_BASE_URL + '/policies/' + policyId + '?with[]=clients')

        let customer = resp.data.clients.find(i => i.is_holder === 0)
        let holders = resp.data.clients.reduce((filtered, client) => {
            if(client.is_holder === 1) {
                filtered.push({
                    resident_bool: !!client.resident_bool,
                    is_holder: !!client.is_holder,
                    country_code: client.country_code,
                    customer_is_holder: true,
                    iin: client.iin,
                    document_type_id: client.document_type_id,
                    document_number: client.document_number,
                    document_gived_date: client.document_gived_date,
                    document_gived_by: client.document_gived_by,
                    last_name: client.last_name,
                    first_name: client.first_name,
                    middle_name: client.middle_name,
                    last_name_eng: client.last_name_eng,
                    first_name_eng: client.first_name_eng,
                    middle_name_eng: client.middle_name_eng,
                    born: moment(client.born).format('DD.MM.YYYY'),
                    sex_id: client.sex_id,
                    address: client.juridical_address,
                    mobile_phone: resp.data.phone,
                })
            }
            return filtered
        }, [])

        let premium = {
            total: {
                premium: resp.data.premium,
                amount_cur: resp.data.amount_cur,
                days: resp.data.days,
                exchange_rate: resp.data.exchange_rate,
                premium_rate: resp.data.premium_rate,
            },
            clients: resp.data.clients.reduce((filtered, client, index) => {
                if(client.is_holder === 1) {
                    filtered.push({
                        age: 0,
                        amount_cur: client.amount_cur,
                        amount_sum: client.amount_sum,
                        exchange_rate: client.exchange_rate,
                        external_id: index,
                        premium: client.premium,
                        premium_rate: client.premium_rate,
                        fio: [client.last_name, client.first_name, client.middle_name].join(' '),
                        iin: client.iin,
                    })
                }
                return filtered
            }, [])
        }

        commit('SET_DATA', {premium})
        commit('SET_DATA', {policy_id: resp.data.id})
        commit('SET_DATA', {policy_number: resp.data.policy_number})
        commit('SET_DATA', {policy_status: resp.data.status})

        // eslint-disable-next-line no-unused-vars
        let step1Data = {
            agent_id_1c: resp.data.agent_id_1c,
            premium: resp.data.premium_rate,
            countries: resp.data.trip_country_codes.map(i => i.alpha_code),
            insured_days: resp.data.days,
            period: {date_begin: moment(resp.data.date_begin), date_end: moment(resp.data.date_end)},
            amount_sum: resp.data.clients[0].amount_sum,
            without_franchise: !!resp.data.without_franshize,
            covid: !!resp.data.without_franshize,
            range: resp.data.range_id,
            purpose: resp.data.trip_goal,
            is_active: !!resp.data.leisure,
            clients: resp.data.clients.reduce((filtered, client) => {
                if(client.is_holder === 1) {
                    filtered.push({born: moment(client.born).format('DD.MM.YYYY')})
                }
                return filtered
            }, []),
        }

        // eslint-disable-next-line no-unused-vars
        let step2Data = {
            resident_bool: !!customer.resident_bool,
            is_holder: !!customer.is_holder,
            country_code: customer.country_code,
            customer_is_holder: true,
            iin: customer.iin,
            document_type_id: customer.document_type_id,
            document_number: customer.document_number,
            document_gived_date: customer.document_gived_date,
            document_gived_by: customer.document_gived_by,
            last_name: customer.last_name,
            first_name: customer.first_name,
            middle_name: customer.middle_name,
            last_name_eng: customer.last_name_eng,
            first_name_eng: customer.first_name_eng,
            middle_name_eng: customer.middle_name_eng,
            born: moment(customer.born).format('DD.MM.YYYY'),
            sex_id: customer.sex_id,
            address: customer.juridical_address,
            mobile_phone: resp.data.phone,
            email: resp.data.email
        };

        // eslint-disable-next-line no-unused-vars
        let step3Data = holders;

        for (let i = 1; i <= state.steps.length; i++) {
            let stepData = eval(`step${i}Data`);
            commit('SET_STEP_DATA', {data: stepData, step: i-1});
            if (i !== state.steps.length) {
                dispatch('CHANGE_STEP', i);
            }
        }

    },
    async LOAD_TARIFES({commit}) {
        commit('SET_DATA', {loading: true})

        try {
            let resp = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/mst-autoshop-tariffs')
            await commit('SET_DATA', {tarifes: resp.data})
        } catch (e) {
            return e.response.data
        } finally {
            commit('SET_DATA', {loading: false})
        }
    },
    async LOAD_COUNTRIES({commit}) {
        commit('SET_DATA', {loading: true})
        let countries = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/countries?where[alpha_code][operator]=IS NOT&where[alpha_code][value]=NULL&with[]=correctionFactorsAmountSum')
        await commit('SET_DATA', {countries: countries.data})
        await commit('SET_DATA', {loading: false})
    },
    async LOAD_MULTI_RANGES({commit}) {
        commit('SET_DATA', {loading: true})
        let resp = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/mst-multi-ranges')
        await commit('SET_DATA', {multiRanges: resp.data})
        await commit('SET_DATA', {loading: false})
    },
    async LOAD_AMOUNT_SUMS({commit}, ) {
        commit('SET_DATA', {loading: true})
        let resp = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/mst-amount-sums')
        await commit('SET_DATA', {amountSums: resp.data})
        await commit('SET_DATA', {loading: false})
    },
    async LOAD_PURPOSES({commit}) {
        commit('SET_DATA', {loading: true})
        let resp = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/purposes?with[]=correctionFactorsAmountSum&where[status]=1')
        await commit('SET_DATA', {purposes: resp.data})
        await commit('SET_DATA', {loading: false})
    },
    async LOAD_CORRECTION_FACTORS({commit}) {
        commit('SET_DATA', {loading: true})
        let resp = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/mst-correction-factors')
        await commit('SET_DATA', {correctionFactors: resp.data})
        await commit('SET_DATA', {loading: false})
    },
    async LOAD_DOCUMENT_TYPES({commit}) {
        commit('SET_DATA', {loading: true})
        let resp = await apiClient.get(process.env.VUE_APP_DICTIONARY_BASE_URL + '/document-types')
        await commit('SET_DATA', {documentTypes: resp.data})
        await commit('SET_DATA', {loading: false})
    },
    async GET_PREMIUM({commit, getters}, clients) {
        commit('SET_DATA', {loading: true})
        let step1Data = getters.getStepByField('component', 'Step_1').data;
        let params = {
            is_autoshop: 1,
            date_begin: step1Data.period.date_begin.format('DD.MM.YYYY'),
            date_end: step1Data.period.date_end.format('DD.MM.YYYY'),
            insured_days: step1Data.insured_days ?? 0,
            trip_country_codes: step1Data.countries,
            trip_goal: step1Data.purpose,
            amount_cur: 'EUR',
            covid: 0,
            without_franshize: 1,
            leisure: 0,
        }

        try {
            params.holders = clients.map((client, index) => {
                return {
                    external_id: index,
                    amount_sum: step1Data.amount_sum,
                    born: client.born
                }
            })
        } catch(e) {
            commit('SET_DATA', {loading: false})
            return {success: false, message: 'Проверьте форму'}
        }

        try {
            let resp = await apiClient.get(process.env.VUE_APP_MST_BASE_URL + '/get-premium', {
                params,
                paramsSerializer: params => {
                    return qs.stringify(params)
                }})

            let result = await resp.data.data.premium_list.client.map((client, index) => {

                client.fio = clients[index].first_name ? clients[index].first_name +' '+ clients[index].last_name : ''
                client.iin = clients[index].iin
                return client
            })
            commit('SET_DATA', {premium: {total: resp.data.data.premium_list.total, clients: result}})
            return resp.data
        } catch(e) {
            return e.response.data
        } finally {
            commit('SET_DATA', {loading: false})
        }
    },
    async SEARCH_CLIENT({commit}, params) {
        commit('SET_DATA', {loading: true})
        return new Promise((resolve, reject) => {
            apiClient.get(process.env.VUE_APP_CLIENT_BASE_URL + '/get-client', {params})
                .then(resp => {
                    let data = resp.data.data;
                    data.resident_bool = !!data.resident_bool
                    if(data.document_type_id !== DOCUMENT_TYPE_ID_PASSPORT) {
                        data.document_type_id = DOCUMENT_TYPE_ID_PASSPORT;
                        delete data.document_number;

                        data.document_gived_date = null;
                        delete data.document_gived_by;
                    }
                    resolve(data)
                })
                .catch(e => {
                    reject(e)
                })
                .then(() => commit('SET_DATA', {loading: false}))
        })
    },
    async SET_CANCELLATION({commit}, policy_number) {
        commit('SET_DATA', {loading: true})
        try {
            let resp = await apiClient.post(process.env.VUE_APP_MST_BASE_URL + '/set-cancellation-contract', {policy_number})
            commit('SET_DATA', {policy_status: resp.data.data.status})
            commit('SET_DATA', {loading: false})
            return resp.data
        } catch(e) {
            commit('SET_DATA', {loading: false})
            return e.response.data
        }
    },
    async SET_POLICY({commit, getters, state}) {
        commit('SET_DATA', {loading: true})
        let step1Data = getters.getStepByField('component', 'Step_1').data
        let step2Data = getters.getStepByField('component', 'Step_2').data
        let step3Data = getters.getStepByField('component', 'Step_3').data

        let params = {
            is_autoshop: 1,
            franchise: 500,
            policy_id: state.policy_id === 'new' ? '' : state.policy_id,
            is_draft: state.is_draft ? 1 : 0,
            date_begin: step1Data.period.date_begin.format('DD.MM.YYYY'),
            date_end: step1Data.period.date_end.format('DD.MM.YYYY'),
            insured_days: step1Data.insured_days ?? 0,
            trip_country_codes: step1Data.countries,
            trip_goal: step1Data.purpose,
            amount_cur: 'EUR',
            covid: step1Data.covid ? 1 : 0,
            notification_type: 1,
            range_id: step1Data.range,
            without_franshize: step1Data.without_franchise ? 1 : 0,
            leisure: step1Data.is_active ? 1 : 0,
            email: step2Data.email,
            phone: step2Data.mobile_phone,
        }
        params.holders = [...step3Data, step2Data].map(client => {
            return {
                is_holder: client.is_holder,
                amount_sum: step1Data.amount_sum,
                resident_bool: client.resident_bool,
                iin: client.iin,
                first_name: client.first_name,
                last_name: client.last_name,
                middle_name: client.middle_name,
                first_name_eng: client.first_name_eng,
                last_name_eng: client.last_name_eng,
                born: client.born,
                sex_id: client.sex_id,
                country_code: client.country_code,
                document_type_id: client.document_type_id,
                document_number: client.document_number,
                document_gived_date: client.document_gived_date,
                document_gived_by: client.document_gived_by,
                juridical_address: client.address,
            }
        })

        try {
            let resp = await apiClient.post(process.env.VUE_APP_MST_BASE_URL + '/set-policy', params)
            commit('SET_DATA', {policy_status: resp.data.data.status})
            commit('SET_DATA', {policy_id: resp.data.data.id})
            commit('SET_DATA', {policy_number: resp.data.data.policy_number})
            commit('SET_DATA', {loading: false})
            return resp.data
        } catch (e) {
            commit('SET_DATA', {loading: false})
            return e.response.data
        }

    },
    async SAVE_STEP_DATA({commit}, payload) {
        commit('SET_STEP_DATA', {step: payload.step, data: cloneDeep(payload.data)})
    },
    async CHANGE_STEP({commit}, step) {
        commit('SET_STEP_STATUS', {status:'finish'});
        commit('SET_DATA', {currentStep: step});
        commit('SET_STEP_STATUS', {status:'process'});
    },
    async RESET_STATE({commit}) {
        return await commit('RESET')
    },
}
