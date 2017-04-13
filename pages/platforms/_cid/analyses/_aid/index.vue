<template>
  <v-container v-if="analysis">
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid-analyses', params: { cid: $route.params.cid } }"><v-icon>arrow_back</v-icon></v-btn>
      <v-btn v-if="canEdit" flat router :href="{ name: 'platforms-cid-analyses-aid-edit', params: { cid: $route.params.cid, aid: $route.params.aid } }">Éditer</v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-card-text>
        <v-container fluid>
          <div class="title">Titre</div>
          <p v-text="analysis.title"></p>

          <div class="title">URL</div>
          <p v-text="analysis.url" class="break-all"></p>

          <v-row>
            <v-col xs12 sm6 md4>
              <div class="title">Type</div>
              <p v-text="analysis.rtype"></p>
            </v-col>
            <v-col xs12 sm6 md4>
              <div class="title">Format</div>
              <p v-text="analysis.mime"></p>
            </v-col>
            <v-col xs12 sm12 md4>
              <div class="title">UnitID</div>
              <p v-text="analysis.unitid"></p>
            </v-col>
          </v-row>

          <v-row v-if="analysis.comment">
            <div class="title">Remarques</div>
            <p v-text="analysis.comment"></p>
          </v-row>

          <v-card class="my-3" v-if="analysis.identifiers && analysis.identifiers.length">
            <v-card-row class="blue-grey lighten-5">
              <v-card-title>
                Champs reconnus
              </v-card-title>
            </v-card-row>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(id, index) in analysis.identifiers" :key="index">
                  <td v-text="id.type"></td>
                  <td v-text="id.value"></td>
                </tr>
              </tbody>
            </table>
          </v-card>

          <v-card class="my-3" v-if="analysis.pathParams && analysis.pathParams.length">
            <v-card-row class="blue-grey lighten-5">
              <v-card-title>
                Éléments de la route
              </v-card-title>
            </v-card-row>
            <table>
              <thead>
                <tr>
                  <th>Valeur</th>
                  <th>Commentaire</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(id, index) in analysis.pathParams" :key="index">
                  <td v-text="id.value"></td>
                  <td v-text="id.comment"></td>
                </tr>
              </tbody>
            </table>
          </v-card>

          <v-card class="my-3" v-if="analysis.queryParams && analysis.queryParams.length">
            <v-card-row class="blue-grey lighten-5">
              <v-card-title>
                Paramètres de la query
              </v-card-title>
            </v-card-row>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Valeur</th>
                  <th>Commentaire</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(id, index) in analysis.queryParams" :key="index">
                  <td v-text="id.name"></td>
                  <td v-text="id.value"></td>
                  <td v-text="id.comment"></td>
                </tr>
              </tbody>
            </table>
          </v-card>
        </v-container>

      </v-card-text>
    </v-card>
  </v-container>

  <v-container v-else>
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid-analyses', params: { cid: $route.params.cid } }"><v-icon>arrow_back</v-icon></v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-card-text>
        Analyse introuvable
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'analysis',
  async fetch ({ params, store, error }) {
    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message    = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }

    store.dispatch('GET_ANALYSIS', params.aid)
  },
  head () {
    return {
      title: `Analyses: ${this.card.name}`
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    analysis () {
      return this.$store.state.analysis
    },
    canEdit() {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    }
  }
}
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }
</style>