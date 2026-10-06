// لون ثابت لكل مادة، وأول حرف من اسمها
import { HUES } from '../components/icons'
const HUE_LIST = Object.values(HUES)
export const courseHue = (id = '') => HUE_LIST[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUE_LIST.length]
export const initial = (name = '') => name.replace(/^ال/, '').trim()[0]
