<template>
  <section>
    <v-btn @click.native="saveSettings" flat router exact :to="{ name: 'ezlogger' }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>

    <v-card class="mb-4">
      <v-toolbar card dense dark class="secondary">
        <v-toolbar-title>{{ $t('ezLoggerSettings.instance') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-switch v-model="preprod" hide-details :label="$t('ezLoggerSettings.useNationalInstance')"></v-switch>
        <v-text-field v-if="!preprod" v-model="ezpaarseUrl" hide-details name="instance-url" :label="$t('ezLoggerSettings.customUrl')"></v-text-field>
        <p>{{ $t('ezLoggerSettings.nationalInstanceDesc') }}</p>
      </v-card-text>

      <v-divider/>

      <v-card-text>
        <v-btn @click.native="testConnection" :loading="connectionTest.loading">
          <v-icon left>mdi-swap-vertical</v-icon> {{ $t('ezLoggerSettings.checkAvailability') }}
        </v-btn>

        <v-alert color="success" :value="connectionTest.version">
          <div>{{ $t('ezLoggerSettings.connectionSuccessful') }}</div>
          <div>{{ $t('ezLoggerSettings.version', { version: connectionTest.version }) }}</div>
        </v-alert>
        <v-alert color="error" :value="true" v-if="connectionTest.errorMsg">
          {{ $t(`ezLoggerSettings.${connectionTest.errorMsg}`, connectionTest.errorMeta) }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense dark class="secondary">
        <v-toolbar-title>{{ $t('ezLoggerSettings.general') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-switch v-model="autoRemoveNoise" :label="$t('ezLoggerSettings.autoNoiseFiltering')"></v-switch>
        <v-switch v-model="patchHyphens" :label="$t('ezLoggerSettings.patchHyphens')"></v-switch>
        <p>{{ $t('ezLoggerSettings.patchHyphensDesc') }}</p>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense dark class="secondary">
        <v-toolbar-title>{{ $t('ezLoggerSettings.headers') }}</v-toolbar-title>
        <v-btn @click.native="addHeader" class="pink" dark small absolute bottom right fab>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-data-table :items="settings.headers" hide-actions hide-headers>
        <template slot="items" slot-scope="props">
          <td>
            <v-text-field
              v-model="props.item.name"
              :label="$t('ezLoggerSettings.name')"
              single-line
              full-width
              hide-details
            />
          </td>
          <td>
            <v-text-field
              v-model="props.item.value"
              :label="$t('ezLoggerSettings.value')"
              single-line
              full-width
              hide-details
            />
          </td>
          <td class="text-xs-right">
            <v-btn icon @click.native="removeHeader(props.index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense dark class="secondary">
        <v-toolbar-title>{{ $t('ezLoggerSettings.proxySuffixes') }}</v-toolbar-title>
        <v-btn @click.native="addProxy" class="pink" dark small absolute bottom right fab>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-data-table :items="settings.proxySuffixes" hide-actions hide-headers>
        <template slot="items" slot-scope="props">
          <td>
            <v-text-field
              v-model="props.item.str"
              :label="$t('ezLoggerSettings.suffix')"
              single-line
              full-width
              hide-details
            />
          </td>
          <td class="text-xs-right">
            <v-btn icon @click.native="removeProxy(props.index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import axios from '~/plugins/axios'

export default {
  name: 'settings',
  transition: 'slide-x-transition',
  head () {
    return {
      title: 'ezLogger'
    }
  },
  async fetch ({ store }) {
    await store.dispatch('ezlogger/loadSettings')
  },
  data () {
    return {
      connectionTest: {
        loading: false,
        errorMsg: null,
        errorMeta: null,
        version: null
      }
    }
  },
  computed: {
    ...mapState('ezlogger', {
      settings: 'settings'
    }),
    autoRemoveNoise: {
      get () { return this.$store.state.ezlogger.settings.autoRemoveNoise },
      set (value) { return this.$store.commit('ezlogger/setAutoRemoveNoise', value) }
    },
    patchHyphens: {
      get () { return this.$store.state.ezlogger.settings.patchHyphens },
      set (value) { return this.$store.commit('ezlogger/setPatchHyphens', value) }
    },
    preprod: {
      get () { return this.$store.state.ezlogger.settings.preprod },
      set (value) { return this.$store.commit('ezlogger/setPreprod', value) }
    },
    ezpaarseUrl: {
      get () { return this.$store.state.ezlogger.settings.ezpaarseUrl },
      set (value) { return this.$store.commit('ezlogger/setEzpaarseUrl', value) }
    }
  },
  methods: {
    ...mapActions('ezlogger', [
      'addHeader',
      'addProxy',
      'removeHeader',
      'removeProxy',
      'saveSettings'
    ]),
    testConnection: function () {
      const ezpaarseUrl = this.preprod
        ? 'http://ezpaarse-preprod.couperin.org'
        : this.ezpaarseUrl

      if (!ezpaarseUrl || this.connectionTest.loading) { return }

      this.connectionTest.loading = true
      this.connectionTest.errorMsg = null
      this.connectionTest.errorMeta = null
      this.connectionTest.version = null

      axios.get(`${ezpaarseUrl}/info/version`)
        .then(response => {
          this.connectionTest.loading = false

          if (response.status !== 200) {
            this.connectionTest.errorMsg = 'error_invalid_status'
            this.connectionTest.errorMeta = { status: response.status }
            return
          }

          const body = response.data
          const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(body)

          if (!match) {
            this.connectionTest.errorMsg = 'error_no_version'
            return
          }

          const majorVersion = parseInt(match[1])
          const minorVersion = parseInt(match[2])

          if (majorVersion < 2 || (majorVersion === 2 && minorVersion < 9)) {
            this.connectionTest.errorMsg = 'error_version_mistmatch'
            this.connectionTest.errorMeta = { version: body }
            return
          }

          this.connectionTest.version = body
        }).catch(err => {
          this.connectionTest.loading = false

          if (err.response) {
            // Got response but status falls out of 2xx
            this.connectionTest.errorMsg = 'error_invalid_status'
            this.connectionTest.errorMeta = { status: err.response.status }
          } else if (err.request) {
            // No response
            this.connectionTest.errorMsg = 'error_no_response'
          } else {
            // Something happened
            this.connectionTest.errorMsg = 'error_generic'
          }
        })
    }
  }
}
</script>