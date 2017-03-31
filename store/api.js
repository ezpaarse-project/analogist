import axios from '~plugins/axios'
const api = {}

api.info = function () {
  return axios.get('/api').then(res => res.data)
}

api.createCard = function (card) {
  return axios.post('/api/platforms', card)
}

api.updateComment = function (cardID, text) {
  return axios.patch(`/api/platforms/${cardID}/comment`, { text: text })
}

api.updateCard = function (cardID, changes) {
  return axios.patch(`/api/trello/cards/${cardID}`, changes)
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

api.addUserToCard = function (card, user) {
  return axios.post(`/api/trello/cards/${card.id}/members`, {
    id: user.id
  }).then(res => {
    card.idMembers.push(user.id)
    card.members.push(user)
    return res.data
  })
}

api.checkDomain = function (domain, callback) {
  axios.get(`http://ezpaarse-preprod.couperin.org/info/domains/${domain}`)
  .then(res => {
    callback(null, res.data)
  }).catch(res => {
    callback(res.status === 404 ? null : res, null)
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
  if (platform) {
    card.platform = platform

    // Select the latest date between trello and analogist
    if (platform.lastModified > card.dateLastActivity) {
      card.lastActivity = platform.lastModified
    } else {
      card.lastActivity = card.dateLastActivity
    }
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
