<template>
  <section>
    <v-layout row justify-space-between>
      <v-btn flat router exact :to="{ name: 'platforms-cid-analyses', params: { cid: $route.params.cid } }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>
    </v-layout>

    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ card.name }}
        </v-toolbar-title>

        <v-btn absolute fab bottom right class="pink" v-if="analysis && canEdit" :to="{ name: 'platforms-cid-analyses-aid-edit', params: { cid: $route.params.cid, aid: $route.params.aid } }">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-toolbar>

      <template v-if="analysis">
        <v-card-text>

          <div class="grey--text">
            {{ $t('analyses.updated')}} {{ updatedAt }} <span v-if="updatedBy">{{ $t('analyses.by') }} {{ updatedBy.fullName }}</span>
          </div>

          <div class="headline" v-text="analysis.title"></div>
          <p class="break-all" v-text="analysis.url"></p>

          <v-layout row wrap>
            <v-chip label v-if="analysis.rtype" class="blue white--text" v-tooltip:bottom="{ html: $t('analyses.type') }">
              <v-icon left>mdi-tag</v-icon>
              {{ analysis.rtype }}
            </v-chip>

            <v-chip label v-if="analysis.mime" class="blue white--text" v-tooltip:bottom="{ html: $t('analyses.format') }">
              <v-icon left>mdi-file</v-icon>
              {{ analysis.mime }}
            </v-chip>

            <v-chip label v-if="analysis.unitid" class="blue white--text" v-tooltip:bottom="{ html: $t('analyses.unitid') }">
              <v-icon left>mdi-fingerprint</v-icon>
              {{ analysis.unitid }}
            </v-chip>
          </v-layout>

          <v-alert class="pre-wrap" icon="mdi-information-outline" :value="true" info v-if="analysis.comment">{{ analysis.comment }}</v-alert>
        </v-card-text>

        <template v-if="analysis.identifiers && analysis.identifiers.length">
          <v-divider/>
          <v-subheader class="title mt-3">{{ $t('analyses.recognizedFields') }}</v-subheader>

          <table class="datatable table">
            <thead>
              <tr class="text-xs-left">
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
        </template>

        <template v-if="analysis.pathParams && analysis.pathParams.length">
          <v-divider/>
          <v-subheader class="title mt-3">{{ $t('analyses.pathParams') }}</v-subheader>

          <table class="datatable table">
            <thead>
              <tr class="text-xs-left">
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
        </template>

        <template v-if="analysis.queryParams && analysis.queryParams.length">
          <v-divider/>
          <v-subheader class="title mt-3">{{ $t('analyses.queryParams') }}</v-subheader>

          <table class="datatable table">
            <thead>
              <tr class="text-xs-left">
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
        </template>
      </template>

      <v-card-text v-else>
        {{ $t('analyses.notFound') }}
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import moment from 'moment'

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
    },
    updatedAt () {
      return moment(this.analysis.updatedAt).locale(this.$i18n.locale).fromNow()
    },
    updatedBy () {
      try {
        return this.card.members.find(m => m.id === this.analysis.updatedBy)
      } catch (e) {
        return null
      }
    }
  }
}
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }
  .pre-wrap {
    white-space: pre-wrap;
  }
</style>