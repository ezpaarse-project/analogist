<template>
  <v-container>
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platform-cid', params: { cid: card.id } }"><v-icon>arrow_back</v-icon></v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-list two-line>
        <v-list-item v-for="analysis in analyses" v-bind:key="analysis.id">
          <v-list-tile router :href="{ name: 'platform-cid-analyses-aid', params: { cid: card.id, aid: analysis.id } }">
            <v-list-tile-content>
              <v-list-tile-title v-text="analysis.title" />
              <v-list-tile-sub-title>{{ analysis.rtype || '-' }} / {{ analysis.mime || '-' }}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-btn flat icon ripple>
                <v-icon>delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'analyses',
  async fetch ({ params, store, error }) {
    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message    = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }
  },
  head () {
    return {
      title: `Analyses: ${this.$store.state.card.name}`
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    analyses () {
      return this.$store.state.analyses
    }
  }
}
</script>
