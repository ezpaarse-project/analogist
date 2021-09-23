import api from '../store/api'

export default ({ $axios, $config }) => api.setInstance($axios, $config.ezpaarseUrl)
