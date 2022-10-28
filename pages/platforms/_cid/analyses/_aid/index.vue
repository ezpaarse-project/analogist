<template>
  <section>
    <v-btn
      text
      router
      exact
      :to="{ name: 'platforms-cid', params: { cid: $route.params.cid } }"
      class="mb-2 body-2"
    >
      <v-icon left>
        mdi-arrow-left
      </v-icon>{{ $t('ui.back') }}
    </v-btn>

    <v-card>
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ card.name }}</v-toolbar-title>

        <v-spacer />

        <v-tooltip
          v-if="canEdit && !historySelected"
          bottom
        >
          <template #activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('ui.edit')"
              :to="{ name: 'platforms-cid-analyses-aid-edit', params: { cid: $route.params.cid, aid: $route.params.aid } }"
              v-on="on"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('ui.edit')" />
        </v-tooltip>

        <v-tooltip
          v-if="canEdit && isAdmin && historySelected"
          bottom
        >
          <template #activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('ui.replace')"
              :loading="saving"
              @click="replaceAnalysis"
              v-on="on"
            >
              <v-icon>mdi-file-replace</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('ui.replace')" />
        </v-tooltip>

        <v-tooltip
          v-if="canEdit && isAdmin && historySelected"
          bottom
        >
          <template #activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('ui.back')"
              @click="historySelected = null"
              v-on="on"
            >
              <v-icon>mdi-reload</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('ui.back')" />
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              v-if="canEdit && isAdmin"
              icon
              :aria-label="$t('ui.history')"
              @click="historyDialog = !historyDialog"
              v-on="on"
            >
              <v-icon>mdi-book-open-page-variant</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('ui.history') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('analyses.testWithEzlogger')"
              v-on="on"
              @click="exportToEzlogger"
            >
              <v-icon>mdi-file-find</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('analyses.testWithEzlogger')" />
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              v-if="canEdit"
              icon
              v-on="on"
              @click="deleteDialog = true"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span v-text="$t('ui.delete')" />
        </v-tooltip>
      </v-toolbar>

      <v-dialog
        v-model="deleteDialog"
        max-width="400"
      >
        <v-card>
          <v-card-title class="headline">
            {{ $t('ui.areYouSure') }}
          </v-card-title>

          <v-card-text>
            {{ $t('analyses.deleteDesc') }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              v-if="!historySelected"
              color="error"
              :loading="deleting"
              @click.native="deleteAnalysis"
            >
              {{ $t('ui.delete') }}
            </v-btn>
            <v-btn
              v-if="historySelected"
              color="error"
              :loading="deleting"
              @click.native="removeHistory(historySelected)"
            >
              {{ $t('ui.delete') }}
            </v-btn>

            <v-btn
              color="secondary"
              @click.native="deleteDialog = false"
            >
              {{ $t('ui.cancel') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <template v-if="analysis">
        <v-card-text>
          <div
            v-if="analysis.updatedAt"
            class="grey--text"
          >
            {{ $t('analyses.updated') }} {{ updatedAt }} <span v-if="updatedBy">{{ $t('analyses.by') }} {{ updatedBy.fullName }}</span>
          </div>

          <div
            class="headline"
            v-text="analysis.title"
          />
          <p class="body-2">
            <a
              :href="analysis.url"
              target="_blank"
              rel="noreferrer"
            >{{ analysis.url }}</a>
          </p>

          <v-layout>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-chip
                  v-if="analysis.rtype"
                  label
                  color="primary"
                  class="white--text mr-1"
                  v-on="on"
                >
                  <v-icon
                    left
                    color="white"
                  >
                    mdi-tag
                  </v-icon>
                  {{ analysis.rtype }}
                </v-chip>
              </template>
              <span>{{ $t('analyses.type') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-chip
                  v-if="analysis.mime"
                  label
                  color="primary"
                  class="white--text mr-1"
                  v-on="on"
                >
                  <v-icon
                    left
                    color="white"
                  >
                    mdi-file
                  </v-icon>
                  {{ analysis.mime }}
                </v-chip>
              </template>
              <span>{{ $t('analyses.format') }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-chip
                  v-if="analysis.unitid"
                  label
                  color="primary"
                  class="white--text mr-1"
                  v-on="on"
                >
                  <v-icon
                    left
                    color="white"
                    class="white--text"
                  >
                    mdi-fingerprint
                  </v-icon>
                  <a
                    v-if="/^(10.[0-9]{4,})\/(.*)$/i.test(analysis.unitid)"
                    :href="`${dxDoi}${analysis.unitid}`"
                    class="white--text"
                  >
                    {{ analysis.unitid }}
                  </a>
                  <span v-else>
                    {{ analysis.unitid }}
                  </span>
                </v-chip>
              </template>
              <span>{{ $t('analyses.unitid') }}</span>
            </v-tooltip>
          </v-layout>

          <v-alert
            v-if="analysis.comment"
            class="pre-wrap mt-3"
            type="info"
            :value="true"
          >
            {{ analysis.comment }}
          </v-alert>
        </v-card-text>

        <template v-if="analysis.identifiers && analysis.identifiers.length">
          <v-divider />
          <v-subheader class="title mt-3">
            {{ $t('analyses.recognizedFields') }}
          </v-subheader>

          <v-simple-table>
            <template #default>
              <thead>
                <tr class="text-left">
                  <th class="font-weight-regular">
                    {{ $t('analyses.type') }}
                  </th>
                  <th class="font-weight-regular">
                    {{ $t('analyses.value') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(id, index) in analysis.identifiers"
                  :key="index"
                >
                  <td v-text="id.type" />
                  <td v-if="id.type === 'doi'">
                    <a
                      :href="`${dxDoi}${id.value}`"
                      v-text="id.value"
                    />
                  </td>
                  <td
                    v-else
                    v-text="id.value"
                  />
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>

        <template v-if="analysis.pathParams && analysis.pathParams.length">
          <v-divider />
          <v-subheader class="title mt-3">
            {{ $t('analyses.pathParams') }}
          </v-subheader>

          <v-simple-table>
            <template #default>
              <thead>
                <tr class="text-left">
                  <th class="font-weight-regular">
                    {{ $t('analyses.value') }}
                  </th>
                  <th class="font-weight-regular">
                    {{ $t('analyses.comment') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(id, index) in analysis.pathParams"
                  :key="index"
                >
                  <td v-text="id.value" />
                  <td v-text="id.comment" />
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>

        <template v-if="analysis.queryParams && analysis.queryParams.length">
          <v-divider />
          <v-subheader class="title mt-3">
            {{ $t('analyses.queryParams') }}
          </v-subheader>

          <v-simple-table>
            <template #default>
              <thead>
                <tr class="text-left">
                  <th class="font-weight-regular">
                    {{ $t('analyses.name') }}
                  </th>
                  <th class="font-weight-regular">
                    {{ $t('analyses.value') }}
                  </th>
                  <th class="font-weight-regular">
                    {{ $t('analyses.comment') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(id, index) in analysis.queryParams"
                  :key="index"
                >
                  <td v-text="id.name" />
                  <td v-text="id.value" />
                  <td v-text="id.comment" />
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

    <v-dialog
      v-model="historyDialog"
      width="700"
    >
      <v-card>
        <v-card-title class="headline lighten-2">
          {{ $t('ui.history') }}
        </v-card-title>

        <v-data-table
          :headers="historyHeaders"
          :items="analysisHistory"
          hide-default-footer
        >
          <template #[`item.updatedAt`]="{ item }">
            {{ $dateFns.format(new Date(item.updatedAt), 'PPPPpp', { locale: $i18n.locale }) }}
          </template>

          <template #[`item.updatedBy`]="{ item }">
            {{ getUser(item.updatedBy) }}
          </template>

          <template #[`item.actions`]="{ item }">
            <v-btn
              outlined
              text
              @click="viewHistory(item)"
            >
              <v-icon left>
                mdi-eye
              </v-icon>
              {{ $t('history.view') }}
            </v-btn>

            <v-btn
              outlined
              text
              @click="historySelected = item; deleteDialog = true"
            >
              <v-icon left>
                mdi-delete
              </v-icon>
              {{ $t('history.delete') }}
            </v-btn>
          </template>
        </v-data-table>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red"
            text
            @click="historyDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
export default {
  name: 'Analysis',
  transition: 'slide-x-transition',
  asyncData ({ store }) {
    return {
      deleting: false,
      deleteDialog: false,
      historyDialog: false,
      saving: false,
      dxDoi: 'http://dx.doi.org/'
    }
  },
  async fetch ({ params, store, error, $auth }) {
    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }

    store.dispatch('GET_ANALYSIS', params.aid)
    store.dispatch('SET_VISITED_PLATFORM', params.cid)
    store.dispatch('SET_VISITED_ANALYSIS', params.aid)

    store.dispatch('SET_ANALYSIS_HISTORY_SELECTED', null)
    store.dispatch('GET_ANALYSIS_HISTORY', params.aid)

    const { user } = $auth.$state
    try {
      await store.dispatch('badges/getMembers', user)
    } catch (e) { }
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
    historySelected: {
      get () { return this.$store.state.historySelected },
      set (newVal) { this.$store.dispatch('SET_ANALYSIS_HISTORY_SELECTED', newVal) }
    },
    analysis () {
      if (this.historySelected) {
        return this.historySelected
      }
      return this.$store.state.analysis
    },
    user () {
      return this.$auth.$state.user
    },
    users () {
      return this.$store.state.badges.users
    },
    canEdit () {
      return this.user && this.user.isAuthorized
    },
    isAdmin () {
      return this.user && this.user.role === 'admin'
    },
    updatedAt () {
      return this.$dateFns.formatDistanceToNow(new Date(this.analysis.updatedAt), { addSuffix: true })
    },
    updatedBy () {
      try {
        return this.card.members.find(m => m.id === this.analysis.updatedBy)
      } catch (e) {
        return null
      }
    },
    historyHeaders () {
      return [
        {
          text: this.$t('history.date'),
          align: 'start',
          sortable: false,
          value: 'updatedAt'
        },
        {
          text: this.$t('history.user'),
          align: 'start',
          sortable: false,
          value: 'updatedBy'
        },
        {
          text: this.$t('history.actions'),
          align: 'start',
          value: 'actions',
          sortable: false
        }
      ]
    },
    analysisHistory () {
      return this.$store.state.analysisHistory
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
    },

    viewHistory (history) {
      this.historySelected = history
      this.historyDialog = false
    },

    getUser (userId) {
      const user = this.users.find(({ id }) => id === userId)
      return user ? user.fullName : '-'
    },

    async replaceAnalysis () {
      try {
        const tmpAnalysis = Object.assign({}, this.analysis)
        delete tmpAnalysis.analysisId

        await this.$store.dispatch('SAVE_ANALYSIS', {
          cardID: this.card.id,
          analysis: {
            ...tmpAnalysis,
            id: this.analysis.analysisId
          }
        })

        await this.$store.dispatch('ADD_CARD_MEMBER', {
          card: this.card,
          user: {
            id: this.analysis.updatedBy
          }
        })

        try {
          await this.$store.dispatch('FETCH_CARD', this.$route.params.cid)
          await this.$store.dispatch('GET_ANALYSIS', this.analysis.analysisId)

          this.$store.dispatch('GET_ANALYSIS_HISTORY', this.analysis.analysisId)
        } catch (e) {
          this.$store.dispatch('snacks/error', this.$t('history.fetchError'))
        }

        this.historySelected = null

        this.$store.dispatch('snacks/success', 'analyses.saved')
      } catch (e) {
        this.$store.dispatch('snacks/error', 'analyses.saveFailed')
      }

      this.saving = false
    },

    async removeHistory (history) {
      if (!history) { return false }

      try {
        await this.$axios.delete(`/api/analyses/${history.analysisId}/history/${history._id}`)
        this.$store.dispatch('snacks/success', this.$t('history.deleteSuccess'))

        if (this.historySelected) {
          this.historySelected = null
        }

        this.deleting = false
        this.deleteDialog = false
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('history.deleteError'))
      }

      try {
        this.$store.dispatch('GET_ANALYSIS_HISTORY', history.analysisId)
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('history.fetchError'))
      }
      return true
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
