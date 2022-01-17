import {intersection, isEmpty} from 'lodash'

export default {
    targetKeys: (state) => state.roles.filter(item => +item.id % 3 > 1).map(item => item.id),
}