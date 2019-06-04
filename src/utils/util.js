/**
 * Created by thikmix on 2018/11/16.
 */
import { assetsUrl, fontIconUrl } from '../configs'
let utilFunc = {
  initIconFont () {
    let domModule = weex.requireModule('dom')
    domModule.addRule('fontFace', {
      'fontFamily': 'iconfont',
      'src': `url('${fontIconUrl}')`
    })
  },
  setBundleUrl (url, jsFile) {
    const bundleUrl = url
    let host = ''
    let path = ''
    let nativeBase
    const isAndroidAssets = bundleUrl.indexOf(assetsUrl) >= 0 || bundleUrl.indexOf('file://assets/') >= 0
    const isiOSAssets = bundleUrl.indexOf('file:///') >= 0 && bundleUrl.indexOf('WeexDemo.app') > 0
    if (isAndroidAssets) {
      nativeBase = 'file://assets/dist'
    } else if (isiOSAssets) {
      nativeBase = bundleUrl.substring(0, bundleUrl.lastIndexOf('/') + 1)
    } else {
      const matches = /\/\/([^\/]+?)\//.exec(bundleUrl)
      const matchFirstPath = /\/\/[^\/]+\/([^\/\s]+)\//.exec(bundleUrl)
      if (matches && matches.length >= 2) {
        host = matches[1]
      }
      if (matchFirstPath && matchFirstPath.length >= 2) {
        path = matchFirstPath[1]
      }
      nativeBase = 'http://' + host + '/'
    }
    const h5Base = './index.html?page='
    // in Native
    let base = nativeBase
    if (typeof navigator !== 'undefined' && (navigator.appCodeName === 'Mozilla' || navigator.product === 'Gecko')) {
      // check if in weexpack project
      if (path === 'web' || path === 'dist') {
        base = h5Base + '/dist/'
      } else {
        base = h5Base + ''
      }
    } else {
      base = nativeBase + (path ? path + '/' : '')
    }

    const newUrl = base + jsFile
    return newUrl
  },
  getUrlParams (url, name) { // 获取地址栏参数
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = url.slice(url.indexOf('?') + 1).match(reg)
    if (r != null) {
      try {
        return decodeURIComponent(r[2])
      } catch (_e) {
        return null
      }
    }
    return null
  }
}

export default utilFunc
