<template>
  <v-dialog
    :value="value"
    persistent
    max-width="900px"
    @input="setVisible($event)"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5" v-text="$t('ezLogger.settings')" />

        <v-spacer />

        <v-btn
          text
          @click="setVisible(false)"
        >
          {{ $t('ui.close') }}
        </v-btn>
        <v-btn
          color="primary"
          @click="save"
        >
          {{ $t('ui.save') }}
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-2">
        <v-expansion-panels accordion>
          <v-expansion-panel>
            <v-expansion-panel-header>
              {{ $t('ezLoggerSettings.instance') }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-switch
                v-model="preprod"
                hide-details
                :label="$t('ezLoggerSettings.useNationalInstance')"
              />
              <v-text-field
                v-if="!preprod"
                v-model="ezpaarseUrl"
                hide-details
                name="instance-url"
                :label="$t('ezLoggerSettings.customUrl')"
              />
              <p class="black--text">
                {{ $t('ezLoggerSettings.nationalInstanceDesc', { ezpaarseURL: ezpaarseInstance }) }}
              </p>
            </v-expansion-panel-content>

            <v-expansion-panel-content>
              <v-btn
                :aria-label="$t('ezLoggerSettings.checkAvailability')"
                :loading="connectionTest.loading"
                @click.native="testConnection"
              >
                <v-icon left>
                  mdi-swap-vertical
                </v-icon> {{ $t('ezLoggerSettings.checkAvailability') }}
              </v-btn>

              <v-alert
                color="success white--text"
                class="my-2"
                :value="connectionTest.version"
              >
                <div>{{ $t('ezLoggerSettings.connectionSuccessful') }}</div>
                <div>{{ $t('ezLoggerSettings.version', { version: connectionTest.version }) }}</div>
              </v-alert>
              <v-alert
                v-if="connectionTest.errorMsg"
                color="error white--text"
                class="my-2"
                :value="true"
              >
                {{ $t(`ezLoggerSettings.${connectionTest.errorMsg}`, connectionTest.errorMeta) }}
              </v-alert>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              {{ $t('ezLoggerSettings.general') }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-switch
                v-model="autoRemoveNoise"
                :label="$t('ezLoggerSettings.autoNoiseFiltering')"
              />
              <v-switch
                v-model="patchHyphens"
                :label="$t('ezLoggerSettings.patchHyphens')"
              />
              <p class="black--text">
                {{ $t('ezLoggerSettings.patchHyphensDesc') }}
              </p>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              {{ $t('ezLoggerSettings.defaultParser') }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <p class="black--text">
                {{ $t('ezLoggerSettings.defaultParserDesc') }}
              </p>
              <v-autocomplete
                v-model="forceParser"
                :loading="loadingParsers"
                :items="parsers"
                :search-input.sync="parserSearch"
                :filter="filterParsers"
                :label="$t('ezLoggerSettings.parserName')"
                append-icon="mdi-menu-down"
                clear-icon="mdi-close"
                item-text="longname"
                item-value="name"
                cache-items
                clearable
                hide-no-data
                hide-details
                solo
              >
                <template #item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.longname }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.name }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              {{ $t('ezLoggerSettings.headers') }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row
                v-for="(item, index) in settings.headers"
                :key="index"
                align="center"
              >
                <v-col>
                  <v-text-field
                    v-model="item.name"
                    :label="$t('ezLoggerSettings.name')"
                    hide-details
                    dense
                    outlined
                  />
                </v-col>

                <v-col>
                  <v-text-field
                    v-model="item.value"
                    :label="$t('ezLoggerSettings.value')"
                    hide-details
                    dense
                    outlined
                  />
                </v-col>

                <v-col class="shrink">
                  <v-btn
                    icon
                    :aria-label="$t('ui.delete')"
                    @click.native="removeHeader(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <div class="mt-3 text-center">
                <v-btn
                  small
                  outlined
                  color="primary"
                  @click.native="addHeader"
                >
                  <v-icon left>
                    mdi-plus
                  </v-icon>
                  {{ $t('ui.add') }}
                </v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              {{ $t('ezLoggerSettings.proxySuffixes') }}
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row
                v-for="(item, index) in settings.proxySuffixes"
                :key="index"
                align="center"
              >
                <v-col>
                  <v-text-field
                    v-model="item.str"
                    :label="$t('ezLoggerSettings.suffix')"
                    hide-details
                    dense
                    outlined
                  />
                </v-col>
                <v-col class="shrink">
                  <v-btn
                    icon
                    :aria-label="$t('ui.delete')"
                    @click.native="removeProxy(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <div class="mt-3 text-center">
                <v-btn
                  small
                  outlined
                  color="primary"
                  @click.native="addProxy"
                >
                  <v-icon left>
                    mdi-plus
                  </v-icon>
                  {{ $t('ui.add') }}
                </v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    value: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      connectionTest: {
        loading: false,
        errorMsg: null,
        errorMeta: null,
        version: null
      },
      parsers: [],
      parserSearch: '',
      loadingParsers: false,
      ezpaarseInstance: this.$config.ezpaarseUrl
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
    },
    forceParser: {
      get () { return this.$store.state.ezlogger.settings.forceParser },
      set (value) { return this.$store.commit('ezlogger/setForceParser', value) }
    }
  },
  watch: {
    async parserSearch (val) {
      if ((!val && !this.forceParser) || this.parsers.length > 0) { return }
      this.loadingParsers = true

      const ezpaarseUrl = this.getEzpaarseUrl()

      try {
        const { data } = await this.$axios.get(`${ezpaarseUrl}/info/platforms`)
        if (!Array.isArray(data)) { throw new TypeError('invalid response') }
        this.parsers = data
      } catch (e) {
        this.$store.dispatch('snacks/error', 'ezLoggerSettings.failedToFetchParsers')
      }

      this.loadingParsers = false
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
    setVisible (value) {
      this.$emit('input', value)
    },
    async save () {
      await this.saveSettings()
      this.setVisible(false)
    },
    getEzpaarseUrl () {
      return this.preprod
        ? this.ezpaarseInstance
        : this.ezpaarseUrl
    },
    filterParsers (item, queryText) {
      const search = queryText.toLowerCase()
      if (!search) { return true }

      const { name, longname } = item

      if (name && name.toLowerCase().includes(search)) { return true }
      if (longname && longname.toLowerCase().includes(search)) { return true }

      return false
    },
    testConnection () {
      const ezpaarseUrl = this.getEzpaarseUrl()

      if (!ezpaarseUrl || this.connectionTest.loading) { return }

      this.connectionTest.loading = true
      this.connectionTest.errorMsg = null
      this.connectionTest.errorMeta = null
      this.connectionTest.version = null

      this.$axios.get(`${ezpaarseUrl}/info/version`)
        .then((response) => {
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
        }).catch((err) => {
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
