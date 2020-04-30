/**
 * 主题颜色更换工具函数
 * @example
 *
 * import themeMixin from '@/utils/theme'
 * export default {
 *    mixins: [themeMixin(themeConfig)]
 * }
 */
// TODO 只取包含颜色的类，wepack 获取所有有关主题色的值
import { save, get, LOCAL } from 'src/utils/storage'

function pad2 (num) {
  let t = num.toString(16)
  if (t.length === 1) t = '0' + t
  return t
}

function toNum3 (colorStr) {
  colorStr = colorStr.replace('#', '')
  if (colorStr.length === 3) {
    colorStr = colorStr[0] + colorStr[0] + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2]
  }
  let r = parseInt(colorStr.slice(0, 2), 16)
  let g = parseInt(colorStr.slice(2, 4), 16)
  let b = parseInt(colorStr.slice(4, 6), 16)
  return [r, g, b]
}

/**
 * scss 混合颜色函数
 * @param color1 十六进制颜色值 #000
 * @param color2 十六进制颜色值 #fff
 * @param weight1
 * @param alpha1
 * @param alpha2
 * @returns {string}
 */
export function mix (color1, color2, weight1, alpha1, alpha2) {
  color1 = color1.replace('#', '')
  color2 = color2.replace('#', '')
  if (weight1 === undefined) weight1 = 0.5
  if (alpha1 === undefined) alpha1 = 1
  if (alpha2 === undefined) alpha2 = 1

  let w = 2 * weight1 - 1
  let alphaDelta = alpha1 - alpha2
  let w1 = (((w * alphaDelta === -1) ? w : (w + alphaDelta) / (1 + w * alphaDelta)) + 1) / 2
  let w2 = 1 - w1

  let nums1 = toNum3(color1)
  let nums2 = toNum3(color2)
  let r = Math.round(w1 * nums1[0] + w2 * nums2[0])
  let g = Math.round(w1 * nums1[1] + w2 * nums2[1])
  let b = Math.round(w1 * nums1[2] + w2 * nums2[2])
  return '#' + pad2(r) + pad2(g) + pad2(b)
}

/**
 *  转化颜色值为RGB格式
 * @param colorStr
 * @returns {string}
 */
export function hexToRgb (colorStr) {
  colorStr = colorStr.replace('#', '')
  return toNum3(colorStr).join()
}

/**
 * 获取element主题的配色数组,按需 添加
 * @param {string} color 主题主色，如：#409eff
 * @return {Array}
 */
// 这里配置element中skin中default.scss对应
export function getElementThemeColors (color) {
  const colors = []
  const light = [0.2, 0.4, 0.5, 0.7, 0.9]
  const dark = [0.1, 0.2, 0.06]
  colors.push(color)
  // 白色混合
  light.forEach(value => { colors.push(mix('#fff', color, value)) })
  // 黑色
  dark.forEach(value => { colors.push(mix('#000', color, value)) })
  // rgba
  colors.push(hexToRgb(color))
  return colors
}

/**
 * 替换新的颜色码
 * @param {string} styleText 样式内容文本
 * @param {array} oldColors 当前的主题颜色码数组
 * @param {array} newColors 需要更换成的颜色数组
 * @return {*}
 */
export function replaceColors (styleText, oldColors, newColors) {
  oldColors.forEach((color, index) => {
    // rgba 格式 空格匹配
    if (color.indexOf(',') !== -1) {
      color = color.split(',').join('\\s*,\\s*')
    }
    styleText = styleText.replace(new RegExp(color, 'gi'), newColors[index])
  })
  return styleText
}

/**
 * 异步请求
 * @param {string} url 请求地址
 * @param {function} callback 请求成功回调函数
 */
export function async (url, callback) {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)) {
      callback && callback(xhr.responseText)
    }
  }
  xhr.open('GET', url)
  xhr.send(null)
}

/**
 * 切换主题
 * @param {string} val 需要切换到的主题主色颜色码
 * @param {string} oldVal 未切换前的主题主色颜色码
 */

/**
 * 创建主题store模块
 * @param config
 * @returns {{namespaced: boolean, state: {color: string, fontSize: *|number|module:widgets/xdh-flip.props.fontSize|{type}|computed.fontSize|{get, set}, themeList: *|Array|computed.themeList|*[], fontList: *|Array|*[]|computed.fontList, themeShow: boolean}, mutations: {THEME_HANGE(*, *): void, FONT_SIZE_CHANGE(*, *): void, SET_THEME_SHOW(*, *): void}}}
 */
export function createStoreModule (config) {
  return {
    // namespaced: true 是为了声明模块的store，解决不同模块命名冲突的问题
    namespaced: true,
    state: {
      color: config.defaultColor,
      fontSize: config.fontSize,
      themeList: config.themeList,
      fontList: config.fontList,
      themeShow: false
    },
    mutations: {
      THEME_HANGE (state, color) {
        state.color = color
        // localStorage.setItem('hms-theme', JSON.stringify(value))
      },
      FONT_SIZE_CHANGE (state, value) {
        // localStorage.setItem('hms-font-size', value)
        state.fontSize = value
      },
      SET_THEME_SHOW (state, isShow) {
        debugger
        state.themeShow = isShow
      }
    }
  }
}

/**
 *
 * @param config {
 *   defaultColor: '#44BB35',
 *   themeKey: 'hms-web-theme',
 *  fontSizeKey: 'hms-font-size',
 *   fontSize: 10,
 *   themeList: [],
 *  fontList: []
 * }
 * @returns {{created(): void, watch: {'$store.state.theme.color'(*=, *=): void, '$store.state.theme.fontSize'(*=): void}, methods: {changeTheme(*=): void, changeFont(*): void}}}
 */
export function mixin (config) {
  const themConfig = Object.assign({
    defaultColor: '#44BB35',
    themeKey: 'hms-web-theme',
    fontSizeKey: 'hms-font-size',
    fontSize: 10,
    themeList: [],
    fontList: []
  }, config)
  const { defaultColor, themeKey, fontSizeKey } = themConfig
  return {
    data () {
      return {
        defaultColor,
        isThemeChanged: false
      }
    },
    created () {
      if (!this.$store.state.theme) {
        this.$store.registerModule('theme', createStoreModule(themConfig))
      }
      // 设置主题
      const color = get(themeKey, LOCAL)
      if (color) {
        this.$store.commit(`theme/THEME_HANGE`, color)
        // this.changeTheme(color, defaultColor)
      }
      // 设置文字大小
      let font = get(fontSizeKey, LOCAL)
      if (font) {
        font = parseInt(font)
        this.$store.commit(`theme/FONT_SIZE_CHANGE`, font)
        this.changeFont(font)
      }
    },
    watch: {
      '$store.state.theme.color' (val, oldVal) {
        const color = val || defaultColor
        this.changeTheme(color, oldVal || defaultColor)
        save(themeKey, color, LOCAL)
      },
      '$store.state.theme.fontSize' (val) {
        this.changeFont(val)
        save(fontSizeKey, val, LOCAL)
      }
    },
    computed: {
      themeList () {
        debugger
        const theme = this.$store.state.theme
        return (theme && theme.themeList) || []
      }
    },
    methods: {
      changeTheme (val, oldVal) {
        // 如果默认颜色为空或者跟改颜色与默认颜色相同则返回
        if (!val || !oldVal) return
        if (val === this.defaultColor && !this.isThemeChanged) {
          return
        }
        // 拿到头部标签
        const head = document.getElementsByTagName('head')[0]
        //
        const newColors = this.getCutomColor(val)
        const oldColors = this.getCutomColor(oldVal)
        //  获取头部的样式文件
        const links = [].slice.call(head.getElementsByTagName('link'))
          .filter(link => link.getAttribute('rel') === 'stylesheet')

        const styles = [].slice.call(head.getElementsByTagName('style'))
        links.forEach((link, index) => {
          const id = `theme-style-${index}`
          let el = document.getElementById(id)
          if (!el) {
            async(link.href, function (text) {
              // 清除字体文件的定义，减少内容长度
              const urlReg = /[^;^{]+url.*?[};]/g
              text = text.replace(/@font-face{[^}]+}/gi, '')
              // url()中相对路径
              text = text.replace(urlReg, '')
              if (text) {
                el = document.createElement('style')
                el.id = id
                el.innerText = replaceColors(text, oldColors, newColors)
                head.appendChild(el)
              }
            })
          }
        })

        styles.forEach(el => {
          const text = el.innerText
          el.innerText = replaceColors(text, oldColors, newColors)
        })
        this.isThemeChanged = true
      },
      getCutomColor (val) {
        const customRule = this.themeList.find(theme => theme.value === val)
        let replaceColor = getElementThemeColors(val)
        if (customRule && customRule.rules) {
          replaceColor = replaceColor.concat(customRule.rules)
        }
        return replaceColor
      },
      changeFont (val) {
        const size = val
        this.$root.fontSize = size
        if (!this.$_html) {
          this.$_html = document.getElementsByTagName('html')[0]
        }
        this.$_html.style.fontSize = size + 'px'
        localStorage.setItem('hms-font-size', size)
      }
    }
  }
}

export default mixin
