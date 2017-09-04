import axios from '~/plugins/axios'

const api = {}

api.info = function () {
  return axios.get('/api').then(res => res.data)
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

api.updateComment = function (cardID, text) {
  return axios.patch(`/api/platforms/${cardID}/comment`, { text: text }).then(res => res.data)
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

api.getFields = function () {
  return axios.get(`/api/platforms/fields.json`).then(res => res.data)
}

api.addUserToCard = function (card, user) {
  return axios.post(`/api/trello/cards/${card.id}/members`, {
    id: user.id
  }).then(res => {
    card.idMembers.push(user.id)
    card.members.push(user)
    return res.data
  })
}

api.checkDomain = function (domain) {
  return axios.get(`http://ezpaarse-preprod.couperin.org/info/domains/${domain}`)
    .then(res => {
      if (typeof res.data === 'object') { return res.data }
      throw new Error('Invalid Response')
    })
    .catch(err => {
      if (err.response && err.response.status === 404) { return null }
      throw err
    })
}

/**
 * Get trello cards and extend them with their platform data
 */
api.getExtendedCards = function () {
  return api.getCards().then(cards => {
    return api.getPlatforms().then(platforms => {
      const platformsMap = new Map()
      platforms.forEach(p => {
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
  return api.getCard(cardID).then(card => {
    return api.getPlatform(cardID).then(platform => {
      return extendCard(card, platform)
    }).catch(err => {
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

  if (card.labels) {
    card.humanCertified = card.labels.some(l => /^certified:\s*human$/i.test(l.name))
    card.publisherCertified = card.labels.some(l => /^certified:\s*publisher$/i.test(l.name))
  }

  // eslint-disable-next-line no-control-regex
  const regexGithub = new RegExp('code[^\n]+source[^\n]+\n(https?://[^ $\n]+)', 'i')
  // eslint-disable-next-line no-control-regex
  const regexHome   = new RegExp('page[^\n]+accueil[^\n]+\n(https?://[^ $\n]+)', 'i')

  let match = regexGithub.exec(card.desc)
  if (match) { card.githubUrl = match[1] }

  match = regexHome.exec(card.desc)
  if (match) { card.homeUrl = match[1] }

  return card
}

export default api
