<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('ezLogger.title') }}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn icon slot="activator" @click="analyze" :loading="processing">
            <v-icon>mdi-file-find</v-icon>
          </v-btn>
          <span>{{ $t('ezLogger.analyze') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn icon slot="activator" @click="clearRequests">
            <v-icon>mdi-notification-clear-all</v-icon>
          </v-btn>
          <span>{{ $t('ezLogger.clearAll') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn icon slot="activator" @click="showExport = true">
            <v-icon>mdi-upload</v-icon>
          </v-btn>
          <span>{{ $t('ezLogger.export') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn icon slot="activator" @click="filterRequests">
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
          <span>{{ $t('ezLogger.filter') }}</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn icon slot="activator" router exact :to="{ name: 'ezlogger-settings' }">
            <v-icon>mdi-settings</v-icon>
          </v-btn>
          <span>{{ $t('ezLogger.settings') }}</span>
        </v-tooltip>
      </v-toolbar>

      <v-card-text>
        <v-alert outline color="warning" icon="mdi-exclamation" :value="reachCaptureLimit">
          {{ $t('ezLogger.captureLimitReached') }}
        </v-alert>

        <div class="text-xs-center pt-3">
          <v-pagination
            prev-icon="mdi-chevron-left"
            next-icon="mdi-chevron-right"
            v-if="nbPages"
            :length="nbPages"
            v-model="page"
            :total-visible="5"
          />
        </div>
      </v-card-text>

      <v-list v-if="requests.length" two-line>
        <v-list-tile avatar router exact :to="{ name: 'ezlogger-rid', params: { rid: req.id } }" ripple v-for="(req, index) in requests" :key="index">
          <v-list-tile-avatar>
            <v-progress-circular v-if="req.status === 'processing'" indeterminate color="grey" />
            <v-icon v-else-if="req.status === 'pending'" class="grey white--text">mdi-clock</v-icon>
            <v-icon v-else-if="req.status === 'analyzed'" class="green white--text">mdi-lightbulb-on</v-icon>
            <v-icon v-else-if="req.status === 'rejected'" class="orange white--text">mdi-lightbulb</v-icon>
            <v-icon v-else-if="req.status === 'error'" class="red white--text">mdi-alert-circle-outline</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ req.method }} {{ req.url }}</v-list-tile-title>
            <v-list-tile-sub-title>
              <v-tooltip bottom v-if="req.type">
                <v-chip slot="activator" small label color="blue" text-color="white">{{ req.type }}</v-chip>
                <span>{{ $t('ezLogger.requestType') }}</span>
              </v-tooltip>
              <v-tooltip bottom v-if="req.ec && req.ec.rtype">
                <v-chip slot="activator" small label color="green" text-color="white">{{ req.ec.rtype }}</v-chip>
                <span>{{ $t('ezLogger.rtype') }}</span>
              </v-tooltip>
              <v-tooltip bottom v-if="req.ec && req.ec.mime">
                <v-chip slot="activator" small label color="green" text-color="white">{{ req.ec.mime }}</v-chip>
                <span>{{ $t('ezLogger.mime') }}</span>
              </v-tooltip>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-card-text v-else class="text-xs-center">
        {{ $t('ezLogger.waitingForTraffic') }}
      </v-card-text>
    </v-card>

    <v-dialog v-model="showExport" max-width="500px">
      <v-card>
        <v-card-title class="headline" v-html="$t('ezLogger.export')"></v-card-title>

        <v-card-text>
          <p class="text-xs-justify">{{ $t('ezLogger.exportDesc') }}</p>
        </v-card-text>

        <v-card-actions>
          <v-spacer/>
          <v-btn color="primary" @click.stop="exportAsFile">{{ $t('ezLogger.export') }}</v-btn>
          <v-btn color="primary" flat @click.stop="showExport = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import { saveAs } from 'file-saver'
import axios from '~/plugins/axios'

export default {
  name: 'ezlogger',
  transition: 'slide-x-transition',
  head () {
    return {
      title: 'ezLogger'
    }
  },
  data () {
    return {
      processing: false,
      showExport: false
    }
  },
  computed: {
    settings () {
      return this.$store.state.ezlogger.settings
    },
    page: {
      get () { return this.$store.state.ezlogger.page },
      set (value) { return this.$store.commit('ezlogger/setPage', value) }
    },
    nbPages () {
      return Math.ceil(this.$store.state.ezlogger.requests.length / 20)
    },
    requests () {
      return this.$store.state.ezlogger.requests
        .sort((a, b) => {
          if (a.status === 'analyzed') { return -1 }
          if (b.status === 'analyzed') { return 1 }
          return a.timeStamp < b.timeStamp ? 1 : -1
        })
        .slice((this.page - 1) * 20, (this.page - 1) * 20 + 20)
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

    filterRequests () {
      this.$store.dispatch('ezlogger/filterRequests')

      if (this.page > this.nbPages) {
        this.$store.dispatch('ezlogger/setPage', this.nbPages)
      }
    },

    exportAsFile () {
      const dateFormat  = 'DD/MMM/YYYY:HH:mm:ss Z'
      const textContent = this.requests.map(req => {
        // 127.0.0.1 - - [14/Mar/2014:09:39:18 -0700] “GET http://www.somedb.com:80/index.html HTTP/1.1” 200 1234
        return `127.0.0.1 - - [${req.startDate.format(dateFormat)}] "${req.method} ${req.url} HTTP/1.1" ${req.statusCode} ${req.contentLength || 0}`
      }).join('\r\n')

      saveAs(new Blob([textContent], { type: 'text/plain;charset=utf-8' }), 'export.log')
    },

    toLogLines (requests) {
      return requests.map(req => {
        return [
          req.startDate.unix(),
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
        ? 'http://ezpaarse-preprod.couperin.org'
        : this.settings.ezpaarseUrl

      if (!ezpaarseUrl) { return }

      const requests = this.$store.state.ezlogger.requests
      const pending = requests.slice()
      pending.forEach(req => { req.status = 'processing' })

      if (pending.length === 0) { return }

      this.processing = true

      const logs = this.toLogLines(pending)
      const headers = {
        'Accept': 'application/json',
        'Log-Format-EZproxy': '%{timestamp}<[0-9]+> %m %U %s %{size}<[0-9\\-]+> %{ezid}<[0-9]+>'
      }

      this.settings.headers.forEach(h => {
        headers[h.name] = h.value
      })

      axios.post(ezpaarseUrl, logs, { headers })
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
  }
}
</script>
