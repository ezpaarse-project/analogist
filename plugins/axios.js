import api from '../store/api'

export default ({ $axios, env }) => api.setInstance($axios, env.ezpaarseUrl)
