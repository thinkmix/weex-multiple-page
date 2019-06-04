/**
 * 全局混入
 * Created by thikmix on 2018/11/16.
 */
import { apiUrl } from '../configs'
let stream = weex.requireModule('stream')
export default {
  methods: {
    jump (to) {
      if (this.$router) {
        this.$router.push(to)
      }
    },
    isIpx () { // 判断是否是iphone x机型
      return weex && (weex.config.env.deviceModel === 'iPhone10,3' || weex.config.env.deviceModel === 'iPhone10,6')
    },
    HTTP ({ method = 'POST', type = 'json', api, body, headers = { } }, callback) { // 请求
      return stream.fetch({
        method: method,
        type: type,
        url: apiUrl + api,
        body: body,
        headers: headers
      }, callback)
    }
  }
}
