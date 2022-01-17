function formClientFullName(client) {
    let fullName = '';

    if (client.last_name && client.first_name) {
        fullName = `${client.last_name} ${client.first_name}`;

        if (client.middle_name) {
            fullName = `${fullName} ${client.middle_name}`;
        }
    } else if (client.juridical_person_name) {
        fullName = client.juridical_person_name;
    }

    return fullName;
}

export default {
    getHolder(state) {
        return state.steps[0].data;
    },

    getHolderFullName(state, getters) {
        return formClientFullName(getters.getHolder);
    },

    getActiveInsuredPane(state) {
        return state.steps[1].data.find(pane => pane.key === state.activeInsuredPaneKey);
    },

    getInsuredPeople(state) {
        let insuredPeople = [];

        for (const pane of state.steps[1].data) {
            insuredPeople.push(pane.insured);
        }

        return insuredPeople;
    },

    getForeignClients(state, getters) {
        let clients = [];

        if (!+getters.getHolder.resident_bool) {
            clients.push({
                full_name: formClientFullName(getters.getHolder),
                country_id: getters.getHolder.country_id,
                client_type: 0,
            });
        }

        for (const insured of getters.getInsuredPeople) {
            if (!+insured.resident_bool) {
                clients.push({
                    full_name: formClientFullName(insured),
                    country_id: insured.country_id,
                    client_type: 1,
                });
            }
        }

        return clients;
    },

    getActiveVehiclePane(state) {
        return state.steps[2].data.find(pane => pane.key === state.activeVehiclePaneKey);
    },

    getVehicles(state) {
        let vehicles = [];

        for (const pane of state.steps[2].data) {
            vehicles.push(pane.vehicle);
        }

        return vehicles;
    },

    getPeriodData(state) {
        return state.steps[3].data;
    },

    getPeriod(state, getters) {
        let period = getters.getPeriodData;
        let text = '';

        if (period.date_beg) {
            text = `${period.date_beg} - ${period.date_end}`;
        }

        return text;
    },

    getPremium(state, getters) {
        return `${getters.getPeriodData.insurance_premium} тг`;
    },

    getVehicleTypesObject(state) {
        let types = {};

        for (const type of state.vehicleTypes) {
            types[type.esbd_id] = type.title;
        }

        return types;
    },

    getRegionsObject(state) {
        let regions = {};

        for (const region of state.regions) {
            regions[region.esbd_id] = region.title;
        }

        return regions;
    },

    getVehicleDoesNotBelongToRegion(state, getters) {
        let vehicles = getters.getVehicles;

        return vehicles.length === 1 && (vehicles[0].region_id === 17 || vehicles[0].region_id === 18);
    },

    getExtraStep(state) {
        if (state.steps[5]) {
            return state.steps[5].data;
        }

        return {};
    }
};
