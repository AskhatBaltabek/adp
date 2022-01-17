export default () => {
    return {
        pagination: {
            pageSize: 15,
            total: 15000,
            current: 1
        },
        loading: false,
        users: [],
        user: {},
        roles: [],
    }
}