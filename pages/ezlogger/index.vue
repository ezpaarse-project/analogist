<template>
  <section>
    <v-btn
      v-if="lastVisitedPlatform"
      class="mb-2 body-2"
      text
      router
      exact
      :aria-label="$t('ezLogger.backToPlatform')"
      :to="{ name: 'platforms-cid', params: { cid: lastVisitedPlatform } }"
    >
      <v-icon left>
        mdi-arrow-left
      </v-icon>{{ $t('ezLogger.backToPlatform') }}
    </v-btn>

    <v-card>
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
        extended
      >
        <v-toolbar-title>{{ $t('ezLogger.title') }}</v-toolbar-title>

        <v-text-field
          slot="extension"
          v-model="search"
          prepend-icon="mdi-magnify"
          :label="$t('ui.search')"
          single-line
          class="mx-3"
          flat
          @input="updatePage"
        />

        <v-spacer />

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              :loading="processing"
              :aria-label="$t('ezLogger.analyze')"
              v-on="on"
              @click="analyze"
            >
              <v-icon>mdi-file-find</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('ezLogger.analyze') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('ezLogger.clearAll')"
              v-on="on"
              @click="clearRequests"
            >
              <v-icon>mdi-notification-clear-all</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('ezLogger.clearAll') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('ezLogger.export')"
              v-on="on"
              @click="showExport = true"
            >
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('ezLogger.export') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              :aria-label="$t('ezLogger.filter')"
              v-on="on"
              @click="filterRequests"
            >
              <v-icon>mdi-filter-variant</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('ezLogger.filter') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              router
              exact
              :to="{ name: 'ezlogger-settings' }"
              :aria-label="$t('ezLogger.settings')"
              v-on="on"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('ezLogger.settings') }}</span>
        </v-tooltip>
      </v-toolbar>

      <v-card-text>
        <v-alert
          color="warning"
          icon="mdi-exclamation"
          :value="reachCaptureLimit"
        >
          {{ $t('ezLogger.captureLimitReached') }}
        </v-alert>

        <div class="text-center pt-3">
          <v-pagination
            v-if="nbPages"
            v-model="page"
            prev-icon="mdi-chevron-left"
            next-icon="mdi-chevron-right"
            :length="nbPages"
            :total-visible="5"
          />
        </div>
      </v-card-text>

      <v-list
        v-if="requests.length"
        two-line
      >
        <v-list-item
          v-for="(req, index) in paginatedRequests"
          :key="index"
          router
          exact
          :to="{ name: 'ezlogger-rid', params: { rid: req.id } }"
          ripple
        >
          <v-list-item-avatar>
            <v-progress-circular
              v-if="req.status === 'processing'"
              indeterminate
              color="grey"
            />
            <v-icon
              v-else-if="req.status === 'pending'"
              class="grey white--text"
            >
              mdi-clock
            </v-icon>
            <v-icon
              v-else-if="req.status === 'analyzed'"
              class="green white--text"
            >
              mdi-lightbulb-on
            </v-icon>
            <v-icon
              v-else-if="req.status === 'rejected'"
              class="orange white--text"
            >
              mdi-lightbulb
            </v-icon>
            <v-icon
              v-else-if="req.status === 'error'"
              class="red white--text"
            >
              mdi-alert-circle-outline
            </v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ req.method }} {{ req.url }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-tooltip
                v-if="req.type"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-chip
                    small
                    label
                    color="blue"
                    text-color="white"
                    v-on="on"
                  >
                    {{ req.type }}
                  </v-chip>
                </template>
                <span>{{ $t('ezLogger.requestType') }}</span>
              </v-tooltip>
              <v-tooltip
                v-if="req.statusCode"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-chip
                    small
                    label
                    color="blue"
                    text-color="white"
                    v-on="on"
                  >
                    {{ req.statusCode }}
                  </v-chip>
                </template>
                <span>{{ $t('ezLogger.responseStatusCode') }}</span>
              </v-tooltip>
              <v-tooltip
                v-if="req.ec && req.ec.rtype"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-chip
                    small
                    label
                    color="green"
                    text-color="white"
                    v-on="on"
                  >
                    {{ req.ec.rtype }}
                  </v-chip>
                </template>
                <span>{{ $t('ezLogger.rtype') }}</span>
              </v-tooltip>
              <v-tooltip
                v-if="req.ec && req.ec.mime"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-chip
                    small
                    label
                    color="green"
                    text-color="white"
                    v-on="on"
                  >
                    {{ req.ec.mime }}
                  </v-chip>
                </template>
                <span>{{ $t('ezLogger.mime') }}</span>
              </v-tooltip>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-card-text
        v-else
        class="text-center"
      >
        <p>{{ $t('ezLogger.waitingForTraffic') }}</p>
        <p
          class="muted"
          v-html="$t('ezLogger.getTheExtension', { url: extensionUrl })"
        />
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="showExport"
      max-width="500px"
    >
      <v-card>
        <v-card-title
          class="headline"
          v-text="$t('ezLogger.export')"
        />

        <v-card-text>
          <p class="text-justify">
            {{ $t('ezLogger.exportDesc') }}
          </p>
          <p class="text-justify">
            {{ $t('ezLogger.exportUseSearch') }}
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click.stop="exportAsFile"
          >
            {{ $t('ezLogger.export') }}
          </v-btn>
          <v-btn
            color="primary"
            text
            @click.stop="showExport = false"
          >
            {{ $t('ezLogger.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import { saveAs } from 'file-saver'

const perPage = 20

export default {
  name: 'Ezlogger',
  transition: 'slide-x-transition',
  asyncData ({ env }) {
    return {
      processing: false,
      showExport: false,
      extensionUrl: 'https://github.com/ezpaarse-project/ezpaarse-logger-extension#installation',
      ezpaarseInstance: env.ezpaarseUrl
    }
  },
  computed: {
    lastVisitedPlatform () {
      return this.$store.state.lastVisitedPlatform
    },
    settings () {
      return this.$store.state.ezlogger.settings
    },
    page: {
      get () { return this.$store.state.ezlogger.page },
      set (value) { return this.$store.commit('ezlogger/setPage', value) }
    },
    search: {
      get () { return this.$store.state.ezlogger.search },
      set (value) { return this.$store.commit('ezlogger/setSearch', value) }
    },
    nbPages () {
      return Math.ceil(this.requests.length / perPage)
    },
    paginatedRequests () {
      return this.requests.slice((this.page - 1) * perPage, (this.page - 1) * perPage + perPage)
    },
    requests () {
      const search = (this.search || '').toLowerCase()

      return this.$store.state.ezlogger.requests
        .filter(req => req.url.toLowerCase().includes(search))
        .sort((a, b) => {
          if (a.status === 'analyzed') { return -1 }
          if (b.status === 'analyzed') { return 1 }
          return a.timeStamp < b.timeStamp ? 1 : -1
        })
    },
    reachCaptureLimit () {
      return this.$store.state.ezlogger.requests.length >= this.$store.state.ezlogger.settings.captureLimit
    }
  },
  methods: {
    clearRequests () {
      this.$store.dispatch('ezlogger/clearRequests')
      this.$store.dispatch('ezlogger/setPage', 1)
    },

    updatePage () {
      if (this.page <= 0) {
        this.$store.dispatch('ezlogger/setPage', 1)
      } else if (this.page > this.nbPages) {
        this.$store.dispatch('ezlogger/setPage', this.nbPages || 1)
      }
    },

    filterRequests () {
      this.$store.dispatch('ezlogger/filterRequests')
      this.updatePage()
    },

    exportAsFile () {
      const dateFormat  = 'dd/LLL/yyyy:HH:mm:ss xxx'
      const textContent = this.requests
        .sort((a, b) => a.timeStamp > b.timeStamp ? 1 : -1)
        .map(req => {
          // 127.0.0.1 - ezlogger [14/Mar/2014:09:39:18 -0700] “GET http://www.somedb.com:80/index.html HTTP/1.1” 200 1234
          return `127.0.0.1 - ezlogger [${this.$dateFns.format(new Date(req.startDate * 1000), dateFormat, { locale: 'en' })}] "${req.method} ${req.url} HTTP/1.1" ${req.statusCode} ${req.contentLength || 0}`
        }).join('\r\n')

      saveAs(new Blob([textContent], { type: 'text/plain;charset=utf-8' }), 'export.log')
    },

    toLogLines (requests) {
      return requests
        .sort((a, b) => a.timeStamp > b.timeStamp ? 1 : -1)
        .map(req => {
          return [
            req.startDate,
            'ezlogger',
            req.method,
            req.url,
            req.statusCode,
            req.contentLength || '-',
            req.id
          ].join(' ')
        }).join('\r\n')
    },

    analyze () {
      const ezpaarseUrl = this.settings.preprod
        ? this.ezpaarseInstance
        : this.settings.ezpaarseUrl

      if (!ezpaarseUrl) { return }

      const requests = this.$store.state.ezlogger.requests
      const pending = requests.slice()
      pending.forEach(req => { req.status = 'processing' })

      if (pending.length === 0) { return }

      this.processing = true

      const logs = this.toLogLines(pending)
      const headers = {
        Accept: 'application/json',
        'Log-Format-EZproxy': '%{timestamp}<[0-9]+> %u %m %U %s %{size}<[0-9\\-]+> %{ezid}<[0-9]+>'
      }

      if (this.settings.forceParser) {
        headers['Force-Parser'] = this.settings.forceParser
      }

      this.settings.headers.forEach(h => {
        headers[h.name] = h.value
      })

      this.$axios.post(ezpaarseUrl, logs, { headers })
        .then(response => {
          if (response.status !== 200) {
            throw new Error('Got status', response.status)
          }
          this.processing = false
          const ecs = response.data || []
          const ecMap = {}

          ecs.forEach(ec => {
            if (ec.ezid) { ecMap[ec.ezid] = ec }
          })

          pending.forEach(req => {
            req.ec = ecMap[req.id] || null
            req.status = req.ec ? 'analyzed' : 'rejected'
          })
        })
        .catch(() => {
          this.processing = false
          pending.forEach(req => { req.status = 'error' })
        })
    }
  },
  head () {
    return {
      title: 'ezLogger'
    }
  }
}
</script>

<style scoped>
  p.muted {
    color: grey;
    font-size: 0.95em;
  }
</style>
