import {intersection, isEmpty} from 'lodash'
const POLICY_STATUS_OPERATOR_MISTAKE = 6
const POLICY_STATUS_DONE = 10
const POLICY_STATUS_DRAFT = 0


export default {
    getStepByField: state => (field, value) => state.steps.find(i => i[field] === value),
    policyCanceled: state => state.policy_status === POLICY_STATUS_OPERATOR_MISTAKE,
    policyDone: state => state.policy_status === POLICY_STATUS_DONE,
    policyDraft: state => state.policy_status === POLICY_STATUS_DRAFT,
    filteredAmountSums: state => (data) => {
        if (isEmpty(data.countries) || !data.purpose) {
            return state.amountSums
        }
        let correctionFactors = []
        let selectedCountries = state.countries.filter(i => data.countries.indexOf(i.alpha_code) !== -1 && (i.correction_factors_amount_sum.length > 0 || i.is_shengen === 1));
        let purpose = state.purposes.find(i => i.id === data.purpose)

        for(let index in selectedCountries) {
            if(selectedCountries[index].is_shengen === 1) {
                correctionFactors.push(state.countries.find(i => i.country_id === 0).correction_factors_amount_sum.map(i => i.amount_id))
            } else {
                if(!isEmpty(selectedCountries[index].correction_factors_amount_sum)) {
                    correctionFactors.push(selectedCountries[index].correction_factors_amount_sum.map(i => i.amount_id))
                }
            }
        }

        if(!isEmpty(purpose.correction_factors_amount_sum)) {
            correctionFactors.push(purpose.correction_factors_amount_sum.map(i => i.amount_id))
        }


        if(isEmpty(correctionFactors)) {
            return state.amountSums
        } else {
            return state.amountSums.filter(i => intersection(...correctionFactors).indexOf(i.id) !== -1)
        }
    }
}