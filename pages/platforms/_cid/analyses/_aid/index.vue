<template>
  <section>
    <v-btn text router exact :to="{ name: 'platforms-cid', params: { cid: $route.params.cid } }" class="mb-2 body-2">
      <v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}
    </v-btn>

    <v-card>
      <v-toolbar class="secondary" dense dark flat>
        <v-toolbar-title>{{ card.name }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" v-if="canEdit" :to="{ name: 'platforms-cid-analyses-aid-edit', params: { cid: $route.params.cid, aid: $route.params.aid } }">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('ui.edit')"></span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="exportToEzlogger">
              <v-icon>mdi-file-find</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('analyses.testWithEzlogger')"></span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" v-if="canEdit" @click="deleteDialog = true">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('ui.delete')"></span>
        </v-tooltip>
      </v-toolbar>

      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">{{ $t('ui.areYouSure') }}</v-card-title>

          <v-card-text>
            {{ $t('analyses.deleteDesc') }}
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" :loading="deleting" @click.native="deleteAnalysis">{{ $t('ui.delete') }}</v-btn>
            <v-btn color="secondary" @click.native="deleteDialog = false">{{ $t('ui.cancel') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <template v-if="analysis">
        <v-card-text>

          <div class="grey--text">
            {{ $t('analyses.updated')}} {{ updatedAt }} <span v-if="updatedBy">{{ $t('analyses.by') }} {{ updatedBy.fullName }}</span>
          </div>

          <div class="black--text headline" v-text="analysis.title"></div>
          <p class="black--text body-2"><a :href="analysis.url" target="_blank">{{ analysis.url }}</a></p>

          <v-layout>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-chip v-on="on" label v-if="analysis.rtype" color="primary" class="white--text mr-1">
                  <v-icon left color="white">mdi-tag</v-icon>
                  {{ analysis.rtype }}
                </v-chip>
              </template>
              <span>{{ $t('analyses.type') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-chip v-on="on" label v-if="analysis.mime" color="primary" class="white--text mr-1">
                  <v-icon left color="white">mdi-file</v-icon>
                  {{ analysis.mime }}
                </v-chip>
              </template>
              <span>{{ $t('analyses.format') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-chip v-on="on" label v-if="analysis.unitid" color="primary" class="white--text mr-1">
                  <v-icon left color="white">mdi-fingerprint</v-icon>
                  {{ analysis.unitid }}
                </v-chip>
              </template>
              <span>{{ $t('analyses.unitid') }}</span>
            </v-tooltip>
          </v-layout>

          <v-alert class="pre-wrap mt-3" type="info" :value="true" v-if="analysis.comment">{{ analysis.comment }}</v-alert>
        </v-card-text>

        <template v-if="analysis.identifiers && analysis.identifiers.length">
          <v-divider/>
          <v-subheader class="title mt-3">{{ $t('analyses.recognizedFields') }}</v-subheader>

          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr class="text-left">
                  <th class="font-weight-regular">{{ $t('analyses.type') }}</th>
                  <th class="font-weight-regular">{{ $t('analyses.value') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(id, index) in analysis.identifiers" :key="index">
                  <td v-text="id.type"></td>
                  <td v-text="id.value"></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>

        <template v-if="analysis.pathParams && analysis.pathParams.length">
          <v-divider/>
          <v-subheader class="title mt-3">{{ $t('analyses.pathParams') }}</v-subheader>

          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr class="text-left">
                  <th class="font-weight-regular">{{ $t('analyses.value') }}</th>
                  <th class="font-weight-regular">{{ $t('analyses.comment') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(id, index) in analysis.pathParams" :key="index">
                  <td v-text="id.value"></td>
                  <td v-text="id.comment"></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>

        <template v-if="analysis.queryParams && analysis.queryParams.length">
          <v-divider/>
          <v-subheader class="title mt-3">{{ $t('analyses.queryParams') }}</v-subheader>

          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr class="text-left">
                  <th class="font-weight-regular">{{ $t('analyses.name') }}</th>
                  <th class="font-weight-regular">{{ $t('analyses.value') }}</th>
                  <th class="font-weight-regular">{{ $t('analyses.comment') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(id, index) in analysis.queryParams" :key="index">
                  <td v-text="id.name"></td>
                  <td v-text="id.value"></td>
                  <td v-text="id.comment"></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
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
    store.dispatch('SET_VISITED_PLATFORM', params.cid)
    store.dispatch('SET_VISITED_ANALYSIS', params.aid)
  },
  head () {
    return {
      title: `Analyses: ${this.card.name}`
    }
  },
  data () {
    return {
      deleting: false,
      deleteDialog: false
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
  },
  methods: {
    exportToEzlogger () {
      this.$store.dispatch('ezlogger/clearRequests')
      if (this.analysis && this.analysis.url) {
        this.$store.dispatch('ezlogger/addRequestFromUrl', this.analysis.url)
      }
      this.$router.push({ name: 'ezlogger' })
    },

    async deleteAnalysis () {
      this.deleting = true

      try {
        await this.$store.dispatch('DELETE_ANALYSIS', { cardID: this.card.id, analysisID: this.analysis.id })
        this.deleteDialog = false
        this.$router.push({
          name: 'platforms-cid',
          params: { cid: this.card.id }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', 'analyses.deleteFailed')
      }

      this.deleting = false
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