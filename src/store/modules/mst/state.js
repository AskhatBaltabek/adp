export default () => {
    return {
        loading: false,
        currentStep: 0,
        pagination: {
            pageSize: 15,
            total: 0,
            current: 1
        },
        policies: [],
        countries: [],
        multiRanges: [],
        purposes: [],
        amountSums: [],
        correctionFactors: [],
        documentTypes: [],
        premium: {},
        policy_number: null,
        policy_id: 'new',
        policy_status: 0,
        is_draft: true,
        steps: [
            {
                data: {
                    agent_id_1c: null,
                    countries: [],
                    insured_days: null,
                    period: {date_begin: null, date_end: null},
                    amount_sum: null,
                    without_franchise: false,
                    covid: false,
                    range: 0,
                    purpose: null,
                    is_active: false,
                    clients: [
                        {born: null},
                    ],
                },
                component: 'Step_1',
                title: 'Данные расчета',
                status: 'process',
            },
            {
                data: {
                    resident_bool: true,
                    is_holder: false,
                    country_code: 'KAZ',
                    customer_is_holder: true,
                    iin: null,
                    document_type_id: null,
                    document_number: null,
                    document_gived_date: null,
                    document_gived_by: null,
                    last_name: null,
                    first_name: null,
                    middle_name: null,
                    last_name_eng: null,
                    first_name_eng: null,
                    middle_name_eng: null,
                    born: null,
                    sex_id: null,
                    address: null,
                    mobile_phone: null
                },
                component: 'Step_2',
                title: 'Страхователь',
                status: 'wait',
            },
            {
                data: [
                    {
                        resident_bool: true,
                        is_holder: true,
                        country_code: 'KAZ',
                        iin: null,
                        document_type_id: null,
                        document_number: null,
                        document_gived_date: null,
                        document_gived_by: null,
                        last_name: null,
                        first_name: null,
                        middle_name: null,
                        last_name_eng: null,
                        first_name_eng: null,
                        middle_name_eng: null,
                        born: null,
                        sex_id: null,
                        address: null,
                        mobile_phone: null

                    }
                ],
                component: 'Step_3',
                title: 'Застрахованные',
                status: 'wait',
            },
        ]
    }
}