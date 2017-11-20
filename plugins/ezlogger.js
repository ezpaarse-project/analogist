export default ({ store }) => {
  store.dispatch('ezlogger/loadSettings')

  document.addEventListener('ezlogger-request', event => {
    if (!store) { return }

    let info
    try {
      info = JSON.parse(event.detail)
    } catch (e) {
      return
    }

    store.dispatch('ezlogger/addRequest', info)
  })
}
