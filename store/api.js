let axios = null
let ezpaarseUrl = 'http://localhost:59599'

const api = {}

api.setInstance = function (instance, ezpaarse) {
  if (!axios) {
    axios = instance
    ezpaarseUrl = ezpaarse
  }
  return axios
}

api.info = function () {
  return axios.get('/api').then(res => res.data)
}

api.getProfile = function () {
  return axios.get('/api/auth/loggedin').then(res => res.data)
}

api.logout = function () {
  return axios.get('/api/auth/logout')
}

api.createCard = function (card) {
  return axios.post('/api/platforms', card).then(res => res.data)
}

api.reorderAnalyses = function (cardID, order) {
  return axios.patch(`/api/platforms/${cardID}/analyses/order`, order).then(res => res.data)
}

api.updateAnalysis = function (cardID, analysis) {
  return axios.put(`/api/platforms/${cardID}/analyses/${analysis.id}`, analysis).then(res => res.data)
}

api.createAnalysis = function (cardID, analysis) {
  return axios.post(`/api/platforms/${cardID}/analyses`, analysis).then(res => res.data)
}

api.deleteAnalysis = function (cardID, analysisID) {
  return axios.delete(`/api/platforms/${cardID}/analyses/${analysisID}`).then(res => res.data)
}

api.getAnalysisHistory = function (analysisID) {
  return axios.get(`/api/analyses/${analysisID}/history`)
}

api.updateComment = function (cardID, text) {
  return axios.patch(`/api/platforms/${cardID}/comment`, { text }).then(res => res.data)
}

api.updateCard = function (cardID, changes) {
  return axios.patch(`/api/trello/cards/${cardID}`, changes).then(res => res.data)
}

api.getLists = function () {
  return axios.get('/api/trello/lists').then(res => res.data)
}

api.getCards = function () {
  return axios.get('/api/trello/cards').then(res => res.data)
}

api.getCard = function (cardID) {
  return axios.get(`/api/trello/cards/${cardID}`).then(res => res.data)
}

api.getPlatforms = function () {
  return axios.get('/api/platforms').then(res => res.data)
}

api.getPlatform = function (cardID) {
  return axios.get(`/api/platforms/${cardID}`).then(res => res.data)
}

api.deletePlatform = function (cardID) {
  return axios.delete(`/api/platforms/${cardID}`).then(res => res.data)
}

api.addPlatform = function (cardID) {
  return axios.patch(`/api/platforms/${cardID}`).then(res => res.data)
}

api.getFields = function () {
  return axios.get('/api/platforms/fields.json').then(res => res.data)
}

api.moveCard = function (card, listID) {
  return axios.put(`/api/trello/cards/${card.id}/idList`, { id: listID }).then(res => res.data)
}

api.addUserToCard = function (card, user) {
  return axios.post(`/api/trello/cards/${card.id}/members`, {
    id: user.id
  }).then((res) => {
    card.idMembers.push(user.id)
    card.members.push(user)
    return res.data
  })
}

api.checkDomain = function (domain) {
  return axios.get(`${ezpaarseUrl}/info/domains/${domain}`)
    .then((res) => {
      if (typeof res.data === 'object') { return res.data }
      throw new Error('Invalid Response')
    })
    .catch((err) => {
      if (err.response && err.response.status === 404) { return null }
      throw err
    })
}

/**
 * Get trello cards and extend them with their platform data
 */
api.getExtendedCards = function () {
  return api.getCards().then((cards) => {
    if (!Array.isArray(cards)) {
      cards = []
    }

    return api.getPlatforms().then((platforms) => {
      const platformsMap = new Map()
      platforms.forEach((p) => {
        platformsMap.set(p.cardID, p)
      })

      return cards.map(card => extendCard(card, platformsMap.get(card.id)))
    })
  })
}

/**
 * Get a specific trello card and extend it with its platform data
 */
api.getExtendedCard = function (cardID) {
  return api.getCard(cardID).then((card) => {
    return api.getPlatform(cardID).then((platform) => {
      return extendCard(card, platform)
    }).catch((err) => {
      return err.response && err.response.status === 404 ? extendCard(card) : err
    })
  })
}

function extendCard (card, platform) {
  card.platform = platform

  // Select the latest date between trello and analogist
  card.lastActivity = card.dateLastActivity

  if (platform && platform.lastModified > card.dateLastActivity) {
    card.lastActivity = platform.lastModified
  }

  // eslint-disable-next-line no-control-regex
  const regexGithub = /code[^\n]+source[^\n]+\n(https?:\/\/[^ $\n]+)/i
  // eslint-disable-next-line no-control-regex
  const regexHome = /page[^\n]+accueil[^\n]+\n(https?:\/\/[^ $\n]+)/i

  let match = regexGithub.exec(card.desc)
  if (match) { card.githubUrl = match[1] }

  match = regexHome.exec(card.desc)
  if (match) { card.homeUrl = match[1] }

  return card
}

api.getBoardMembers = function () {
  return axios.get('/api/trello/members').then(res => res.data)
}

api.getMember = function (memberId) {
  return axios.get(`/api/trello/member/${memberId}`).then(res => res.data)
}

api.becomeMember = function () {
  return axios.post('/api/auth/membership').then(res => res.data)
}

/**
 * Badges
 */
api.getBadges = function (userId) {
  return axios.get(`/api/badges?id=${userId}`).then(res => res.data)
}

api.getPing = function () {
  return axios.get('/api/badges/ping').then(res => res.data)
}

api.getMetrics = function () {
  return axios.get('/api/badges/metrics').then(res => res.data)
}

api.emit = function (data) {
  return axios.post('/api/badges/emit', data).then(res => res.data)
}

api.setVisiblity = function (data) {
  return axios.put('/api/badges/visibility', data).then(res => res.data)
}

api.getUsers = function (badgeId) {
  return axios.get(`/api/badges/users/${badgeId}`).then(res => res.data)
}

/**
 * Certfificaitions
 */
api.getCertificationsEvents = function () {
  return axios.get('/api/certifications/').then(res => res.data)
}

api.sendRequest = function (cardID, data) {
  return axios({
    method: 'POST',
    url: `/api/certifications/${cardID}`,
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}

api.acceptCertification = function (data) {
  return axios.post(`/api/certifications/${data.id}/accept`, { cardName: data.cardName }).then(res => res.data)
}

api.refuseCertification = function (data) {
  return axios.post(`/api/certifications/${data.id}/refuse`, { cardName: data.cardName, comment: data.comment }).then(res => res.data)
}

export default api
