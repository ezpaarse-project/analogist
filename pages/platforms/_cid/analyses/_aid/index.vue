<template>
  <section>
    <v-layout row justify-space-between>
      <v-btn flat router exact :to="{ name: 'platforms-cid-analyses', params: { cid: $route.params.cid } }"><v-icon left>arrow_back</v-icon>{{ $t('ui.back') }}</v-btn>
    </v-layout>

    <v-card>
      <v-toolbar class="secondary" dark card>
        <v-toolbar-title>
          {{ card.name }}
        </v-toolbar-title>

        <v-btn absolute fab bottom right class="pink" v-if="analysis && canEdit" :to="{ name: 'platforms-cid-analyses-aid-edit', params: { cid: $route.params.cid, aid: $route.params.aid } }">
          <v-icon>mode_edit</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text v-if="analysis">
        <v-container fluid grid-list-md>
          <div class="title">{{ $t('analyses.title')}}</div>
          <p v-text="analysis.title"></p>

          <div class="title">{{ $t('analyses.url')}}</div>
          <p v-text="analysis.url" class="break-all"></p>

          <v-layout row wrap>
            <v-flex xs12 sm6 md4>
              <div class="title">{{ $t('analyses.type')}}</div>
              <p v-text="analysis.rtype"></p>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <div class="title">{{ $t('analyses.format')}}</div>
              <p v-text="analysis.mime"></p>
            </v-flex>
            <v-flex xs12 sm12 md4>
              <div class="title">{{ $t('analyses.unitid')}}</div>
              <p v-text="analysis.unitid"></p>
            </v-flex>
          </v-layout>

          <div class="title">{{ $t('analyses.comment')}}</div>
          <p v-text="analysis.comment"></p>

          <v-card class="my-3" v-if="analysis.identifiers && analysis.identifiers.length">
            <v-toolbar dense card>
              <v-toolbar-title>
                {{ $t('analyses.recognizedFields') }}
              </v-toolbar-title>
            </v-toolbar>

            <table class="datatable table">
              <thead>
                <tr>
                  <th>{{ $t('analyses.type') }}</th>
                  <th>{{ $t('analyses.value') }}</th>
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
            <v-toolbar dense card>
              <v-toolbar-title>
                {{ $t('analyses.pathParams') }}
              </v-toolbar-title>
            </v-toolbar>

            <table class="datatable table">
              <thead>
                <tr>
                  <th>{{ $t('analyses.value') }}</th>
                  <th>{{ $t('analyses.comment') }}</th>
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
            <v-toolbar dense card>
              <v-toolbar-title>
                {{ $t('analyses.queryParams') }}
              </v-toolbar-title>
            </v-toolbar>

            <table class="datatable table">
              <thead>
                <tr>
                  <th>{{ $t('analyses.name') }}</th>
                  <th>{{ $t('analyses.value') }}</th>
                  <th>{{ $t('analyses.comment') }}</th>
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

      <v-card-text v-else>
        {{ $t('analyses.notFound') }}
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
export default {
  name: 'analysis',
  transition: 'slide-x-transition',
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
    canEdit () {
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