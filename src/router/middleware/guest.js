export default function guest ({ next, store }){
    if (store.getters.isAuthenticated) {
        return next({
           name: 'Policies'
        });
    }

    return next();
}