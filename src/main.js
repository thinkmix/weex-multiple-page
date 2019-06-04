/* eslint-disable no-undef */

import * as filters from './filters'
import mixins from './mixins'

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.mixin(mixins)
