let axios = null;
let ezpaarseUrl = 'http://localhost:59599';

const api = {};

api.setInstance = (instance, ezpaarse) => {
  if (!axios) {
    axios = instance;
    ezpaarseUrl = ezpaarse;
  }
  return axios;
};

api.info = () => axios.get('/').then((res) => res.data);

api.getProfile = () => axios.get('/auth/loggedin').then((res) => res.data);

api.logout = () => axios.get('/auth/logout');

api.createCard = (card) => axios.post('/platforms', card).then((res) => res.data);

api.reorderAnalyses = (cardID, order) => axios.patch(`/platforms/${cardID}/analyses/order`, order).then((res) => res.data);

api.updateAnalysis = (cardID, analysis) => axios.put(`/platforms/${cardID}/analyses/${analysis.id}`, analysis).then((res) => res.data);

api.createAnalysis = (cardID, analysis) => axios.post(`/platforms/${cardID}/analyses`, analysis).then((res) => res.data);

api.deleteAnalysis = (cardID, analysisID) => axios.delete(`/platforms/${cardID}/analyses/${analysisID}`).then((res) => res.data);

api.updateComment = (cardID, text) => axios.patch(`/platforms/${cardID}/comment`, { text }).then((res) => res.data);

api.updateCard = (cardID, changes) => axios.patch(`/trello/cards/${cardID}`, changes).then((res) => res.data);

api.getLists = () => axios.get('/trello/lists').then((res) => res.data);

api.getCards = () => axios.get('/trello/cards').then((res) => res.data);

api.getCard = (cardID) => axios.get(`/trello/cards/${cardID}`).then((res) => res.data);

api.getPlatforms = () => axios.get('/platforms').then((res) => res.data);

api.getPlatform = (cardID) => axios.get(`/platforms/${cardID}`).then((res) => res.data);

api.deletePlatform = (cardID) => axios.delete(`/platforms/${cardID}`).then((res) => res.data);

api.addPlatform = (cardID) => axios.patch(`/platforms/${cardID}`).then((res) => res.data);

api.getFields = () => axios.get('/platforms/fields.json').then((res) => res.data);

api.moveCard = (card, listID) => axios.put(`/trello/cards/${card.id}/idList`, { id: listID }).then((res) => res.data);

api.addUserToCard = (card, user) => axios.post(`/trello/cards/${card.id}/members`, {
  id: user.id,
}).then((res) => {
  card.idMembers.push(user.id);
  card.members.push(user);
  return res.data;
});

api.checkDomain = (domain) => axios.get(`${ezpaarseUrl}/info/domains/${domain}`)
  .then((res) => {
    if (typeof res.data === 'object') { return res.data; }
    throw new Error('Invalid Response');
  })
  .catch((err) => {
    if (err.response && err.response.status === 404) { return null; }
    throw err;
  });

function extendCard(trelloCard, platform) {
  const card = trelloCard;

  card.platform = platform;

  // Select the latest date between trello and analogist
  card.lastActivity = card.dateLastActivity;

  if (platform && platform.lastModified > card.dateLastActivity) {
    card.lastActivity = platform.lastModified;
  }

  // eslint-disable-next-line no-control-regex
  const regexGithub = new RegExp('code[^\n]+source[^\n]+\n(https?://[^ $\n]+)', 'i');
  // eslint-disable-next-line no-control-regex
  const regexHome = new RegExp('page[^\n]+accueil[^\n]+\n(https?://[^ $\n]+)', 'i');

  let match = regexGithub.exec(card.desc);
  if (match) { [, card.githubUrl] = match; }

  match = regexHome.exec(card.desc);
  if (match) { [, card.homeUrl] = match; }

  return card;
}

/**
 * Get trello cards and extend them with their platform data
 */
api.getExtendedCards = () => api.getCards().then((trelloCards) => {
  const cards = !Array.isArray(trelloCards) ? [] : trelloCards;

  return api.getPlatforms().then((platforms) => {
    const platformsMap = new Map();
    platforms.forEach((p) => {
      platformsMap.set(p.cardID, p);
    });

    return cards.map((card) => extendCard(card, platformsMap.get(card.id)));
  });
});

/**
 * Get a specific trello card and extend it with its platform data
 */
api.getExtendedCard = (cardID) => api.getCard(cardID)
  .then((card) => api.getPlatform(cardID)
    .then((platform) => extendCard(card, platform))
    .catch((err) => (err.response && err.response.status === 404 ? extendCard(card) : err)));

api.getBoardMembers = () => axios.get('/trello/members').then((res) => res.data);

api.getMember = (memberId) => axios.get(`/trello/member/${memberId}`).then((res) => res.data);

api.becomeMember = () => axios.post('/auth/membership').then((res) => res.data);

/**
 * Badges
 */
api.getBadges = (userId) => axios.get(`/badges?id=${userId}`).then((res) => res.data);

api.getPing = () => axios.get('/badges/ping').then((res) => res.data);

api.getMetrics = () => axios.get('/badges/metrics').then((res) => res.data);

api.emit = (data) => axios.post('/badges/emit', data).then((res) => res.data);

api.setVisiblity = (data) => axios.put('/badges/visibility', data).then((res) => res.data);

api.getUsers = (badgeId) => axios.get(`/badges/users/${badgeId}`).then((res) => res.data);

/**
 * Certfificaitions
 */
api.getCertificationsEvents = () => axios.get('/certifications/').then((res) => res.data);

api.sendRequest = (cardID, data) => axios({
  method: 'POST',
  url: `/certifications/${cardID}`,
  data,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}).then((res) => res.data);

api.acceptCertification = (data) => axios.post(`/certifications/${data.id}/accept`, { cardName: data.cardName }).then((res) => res.data);

api.refuseCertification = (data) => axios.post(`/certifications/${data.id}/refuse`, { cardName: data.cardName, comment: data.comment }).then((res) => res.data);

export default api;
