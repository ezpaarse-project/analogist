export default ({ store }) => {
  store.dispatch('FETCH_PROFILE');
  store.dispatch('FETCH_APP_INFO');
};
