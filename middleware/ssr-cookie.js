export default function ({ $axios, req }) {
  if (process.server && req.headers.cookie) {
    $axios.defaults.headers.common.cookie = req.headers.cookie
  }
}
