export default ({ $axios, req }) => {
  if (process.server && req.headers.cookie) {
    // eslint-disable-next-line no-param-reassign
    $axios.defaults.headers.common.cookie = req.headers.cookie;
  }
};
