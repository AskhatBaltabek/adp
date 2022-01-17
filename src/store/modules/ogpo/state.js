export default () => {
    let client = {
        id: null,
        natural_person_bool: 1,
        resident_bool: 1,
        iin: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        born: null,
        sex_id: undefined,
        document_type_id: undefined,
        document_number: '',
        document_gived_date: null,
        document_gived_by: '',
        country_id: undefined,
        address: '',
        email: '',
        mobile_phone: '',
        notification_type_id: 2,
        driver_certificate: '',
        driver_certificate_date: '',
        driver_certificate_type_id: undefined,
        experience_less: 0,
        age_experience_id: 0,
        class_id: 0,
        class: '',
        juridical_person_name: '',
        activity_kind_id: '',
        economics_sector_id: undefined,
        phones: '',
        is_privileged: 0,
        priveleger_bool: 0,
        priveledger_certificate: '',
        priveledger_certificate_date: '',
        pensioner_bool: 0,
        pensioner_certificate: '',
        pensioner_certificate_date: '',
        wow_bool: 0,
        wow_certificate: '',
        wow_certificate_date: '',
        invalid_bool: 0,
        invalid_certificate: '',
        invalid_certificate_beg_date: '',
        invalid_certificate_end_date: '',
        verify_type_id: 0,
        verified_dt: '',
        verify_bool: 0,
        is_insured: 0
    };

    let vehicle = {
        id: null,
        region_id: undefined,
        reg_num: '',
        vin: '',
        type_id: undefined,
        year: undefined,
        engine_number: '',
        engine_power: null,
        engine_volume: null,
        mark: '',
        model: '',
        reg_cert_num: '',
        dt_reg_cert: null,
        big_city_bool: 0,
        country_id: 1,
        verified_bool: 0,
        dt_verified: '',
    };

    let firstInsuredPaneKey = Math.random().toString().substring(2, 7);
    let firstVehiclePaneKey = Math.random().toString().substring(2, 7);

    // Populate years array
    let i = new Date().getFullYear();
    let years = [];

    while (i >= 1950) {
        years.push(i);
        i--;
    }

    return {
        currentStep: 0,
        documentTypes: [],
        countries: [],
        ageExperiences: [],
        regions: [],
        years: years,
        vehicleTypes: [],
        activityKinds: [],
        economicsSectors: [],
        notificationTypes: ['Нарочно', 'СМС', 'E-Mail', 'СМС и E-Mail'],
        terminationReasons: [
            'Продажа/утрата ТС',
            'Смерть Страхователя',
            'Иными обстоятельствами, чем страховой случай - когда возможность наступления страхового случая отпала, и существование страхового риска прекратилось',
            'Отказом страхователя от договора страхования'
        ],
        refundMethods: [
            'Наличный расчет',
            'Безналичный расчет',
        ],
        policy: {
            id: null,
            parent_id: null,
            esbd_id: null,
            global_id: '',
            policy_number: '',
            manager_id: null,
            agent_id: null,
            period: null,
            insurance_premium: null,
            started_at: null,
            ended_at: null,
            issued_at: null,
            issued_via_ms: 1,
            status: 0,
            return_esbd: '',
            return_ones: '',
            verify_bool: null,
            refund_amount: 0,
            termination_reason: undefined,
            refund_method: undefined,
            bank_name: '',
            iban: '',
            bin: '',
            bik: '',
            card_number: '',
            card_holder: '',
            muns_policy_number: '',
            muns_refund_amount: 0,
            created_at: null,
            updated_at: null,
            parent: null,
            child: null,
        },
        client: client,
        vehicle: vehicle,
        activeInsuredPaneKey: firstInsuredPaneKey,
        activeVehiclePaneKey: firstVehiclePaneKey,
        verificationCode: null,
        steps: [
            {
                data: client,
                component: 'Step_1',
                title: 'Страхователь',
                status: 'process',
            },
            {
                data: [
                    {
                        key: firstInsuredPaneKey,
                        title: 'Новый',
                        insured: client,
                        verified: false,
                    }
                ],
                component: 'Step_2',
                title: 'Список застрахованных',
                status: 'wait',
            },
            {
                data: [
                    {
                        key: firstVehiclePaneKey,
                        title: 'Новый',
                        vehicle: vehicle,
                        verified: false,
                    }
                ],
                component: 'Step_3',
                title: 'Список ТС',
                status: 'wait',
            },
            {
                data: {
                    date_beg: null,
                    date_end: null,
                    refund_amount: 0,
                    insurance_premium: 0,
                },
                component: 'Step_4',
                title: 'Расчет премии',
                status: 'wait',
            },
            {
                data: {},
                component: 'Step_5',
                title: 'Оформление полиса',
                status: 'wait',
            }
        ]
    };
}
