import Vue from "vue"
import Router from "vue-router"
import Login from "@/views/Login"
import Home from "@/views/Home"
import Polices from "@/views/policies/Main"

import NewsIndex from "@/views/news/index"
import News from "@/views/news/Main"
import SingleNew from "@/views/news/SingleNew"

import KaskoIndex from "@/views/kasko/index"
import Kasko from "@/views/kasko/Main"
import Order from "@/views/kasko/order/Order"

import OgpoMain from "@/views/ogpo/Main"
import OgpoIndex from "@/views/ogpo/Index"
import OgpoCreate from "@/views/ogpo/Create"
import OgpoLostRatio from "@/views/ogpo/LostRatio"

import MSTIndex from "@/views/mst/index"
import MSTMain from "@/views/mst/Main"
import MSTOrder from "@/views/mst/Order"

import UsersIndex from "@/views/users/Index"
import UsersMain from "@/views/users/List"
import UserForm from "@/views/users/UserForm"

import AutoShopIndex from "@/views/autoshop/index"
import AutoShopMain from "@/views/autoshop/Main"
import AutoShopOrder from "@/views/autoshop/Order"

import store from "../store"
import middlewarePipeline from './middleware/pipeline'
import guest from './middleware/guest'
import auth from './middleware/auth'

Vue.use(Router);

const router = new Router({
    mode: "history",
    routes: [
        {
            path: "/login",
            name: "Login",
            component: Login,
            meta: {
                middleware: [
                    guest
                ]
            }
        },
        {
            path: "/",
            name: "Home",
            component: Home,
            meta: {
                middleware: [
                    auth
                ]
            },
        },
        {
            path: "/policies",
            name: "Policies",
            component: Polices,
            meta: {
                middleware: [
                    auth
                ]
            }
        },
        {
            path: "/news",
            component: NewsIndex,
            children: [
                {
                    path: '',
                    name: 'News',
                    component: News,
                    meta: {
                        middleware: [
                            auth
                        ]
                    }
                },
                {
                    path: ':id',
                    name: 'New',
                    component: SingleNew,
                    meta: {
                        middleware: [
                            auth
                        ]
                    }
                }
            ]
        },
        {
            path: "/kasko",
            component: KaskoIndex,
            children: [
                {
                    path: '',
                    name: "Kasko",
                    component: Kasko,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: ':id',
                    name: 'policy',
                    component: Order,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
            ],
        },
        {
            path: "/mst",
            component: MSTIndex,
            children: [
                {
                    path: '',
                    name: "MSTMain",
                    component: MSTMain,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: ':id',
                    name: 'mst/policy',
                    component: MSTOrder,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
            ],
        },
        {
            path: "/users",
            component: UsersIndex,
            children: [
                {
                    path: '',
                    name: "Users Main",
                    component: UsersMain,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: ':id',
                    name: 'users/user',
                    component: UserForm,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
            ],
        },
        {
            path: "/autoshop",
            component: AutoShopIndex,
            children: [
                {
                    path: '',
                    name: "AutoShopMain",
                    component: AutoShopMain,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },

                },
                {
                    path: ':id',
                    name: 'autoshop/policy',
                    component: AutoShopOrder,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
            ],
        },
        {
            path: '/ogpo',
            component: OgpoMain,
            children: [
                {
                    path: '/',
                    name: 'ogpo.index',
                    component: OgpoIndex,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: 'create',
                    name: 'ogpo.create',
                    component: OgpoCreate,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: 'lost-ratio',
                    name: 'ogpo.lost_ratio',
                    component: OgpoLostRatio,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: ':id',
                    name: 'ogpo.show',
                    component: OgpoCreate,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                },
                {
                    path: ':id/reissue',
                    name: 'ogpo.reissue',
                    component: OgpoCreate,
                    meta: {
                        middleware: [
                            auth
                        ]
                    },
                }
            ],
        },
    ]
});

router.beforeEach((to, from, next) => {
    if (!to.meta.middleware) {
        return next();
    }

    const middleware = to.meta.middleware;

    const context = {
        to,
        from,
        next,
        store
    };

    return middleware[0]({
        ...context,
        next: middlewarePipeline(context, middleware, 1)
    });
});

export default router;