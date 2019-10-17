import dateSlidePicker from './components/index.vue'
import dateSlidePickerRange from './components/range.vue'

const install = (Vue) => {
  Vue.component(dateSlidePicker.name, dateSlidePicker)
  Vue.component(dateSlidePickerRange.name, dateSlidePickerRange)
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default { install }
