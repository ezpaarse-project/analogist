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

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="canEdit"
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

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
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
          <template v-slot:activator="{ on }">
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
              color="error"
              :loading="deleting"
              @click.native="deleteAnalysis"
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
              <template v-slot:activator="{ on }">
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
              <template v-slot:activator="{ on }">
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
              <template v-slot:activator="{ on }">
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
            <template v-slot:default>
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
            <template v-slot:default>
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
            <template v-slot:default>
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
  </section>
</template>

<script>
export default {
  name: 'Analysis',
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
  data () {
    return {
      deleting: false,
      deleteDialog: false,
      dxDoi: 'http://dx.doi.org/'
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
      return this.$dateFns.formatDistanceToNow(new Date(this.analysis.updatedAt))
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
  },
  head () {
    return {
      title: `Analyses: ${this.card.name}`
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
