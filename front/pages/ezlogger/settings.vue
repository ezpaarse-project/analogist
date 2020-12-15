<template>
  <section>
    <v-btn
      text
      router
      exact
      :to="{ name: 'ezlogger' }"
      class="mb-2 body-2"
      @click.native="saveSettings"
    >
      <v-icon left>
        mdi-arrow-left
      </v-icon>{{ $t('ui.back') }}
    </v-btn>

    <v-card class="mb-4">
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ $t('ezLoggerSettings.instance') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
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
          {{ $t('ezLoggerSettings.nationalInstanceDesc') }}
        </p>
      </v-card-text>

      <v-divider />

      <v-card-text>
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
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ $t('ezLoggerSettings.general') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
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
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar
        dense
        dark
        class="secondary"
      >
        <v-toolbar-title>{{ $t('ezLoggerSettings.defaultParser') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
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
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title v-text="item.longname" />
              <v-list-item-subtitle v-text="item.name" />
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ $t('ezLoggerSettings.headers') }}</v-toolbar-title>
        <v-btn
          class="pink"
          dark
          small
          absolute
          bottom
          right
          fab
          :aria-label="$t('ezLoggerSettings.headers')"
          @click.native="addHeader"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-data-table
        :items="settings.headers"
        hide-default-footer
        hide-default-header
      >
        <template v-slot:item="{ item, index }">
          <tr>
            <td>
              <v-text-field
                v-model="item.name"
                :label="$t('ezLoggerSettings.name')"
              />
            </td>
            <td>
              <v-text-field
                v-model="item.value"
                :label="$t('ezLoggerSettings.value')"
              />
            </td>
            <td class="text-right">
              <v-btn
                icon
                :aria-label="$t('ui.delete')"
                @click.native="removeHeader(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ $t('ezLoggerSettings.proxySuffixes') }}</v-toolbar-title>
        <v-btn
          class="pink"
          dark
          small
          absolute
          bottom
          right
          fab
          :aria-label="$t('ezLoggerSettings.proxySuffixes')"
          @click.native="addProxy"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-data-table
        :items="settings.proxySuffixes"
        hide-default-footer
        hide-default-header
      >
        <template v-slot:body="{ items }">
          <tr
            v-for="(item, index) in items"
            :key="index"
          >
            <td>
              <v-text-field
                v-model="item.str"
                :label="$t('ezLoggerSettings.suffix')"
                class="my-2"
              />
            </td>
            <td
              class="text-right"
              width="36px"
            >
              <v-btn
                icon
                :aria-label="$t('ui.delete')"
                @click.native="removeProxy(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </section>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Settings',
  transition: 'slide-x-transition',
  asyncData({ env }) {
    return {
      connectionTest: {
        loading: false,
        errorMsg: null,
        errorMeta: null,
        version: null,
      },
      parsers: [],
      parserSearch: '',
      loadingParsers: false,
      ezpaarseInstance: env.ezpaarseUrl,
    };
  },
  async fetch({ store }) {
    await store.dispatch('ezlogger/loadSettings');
  },
  head() {
    return {
      title: 'ezLogger',
    };
  },
  computed: {
    ...mapState('ezlogger', {
      settings: 'settings',
    }),
    autoRemoveNoise: {
      get() { return this.$store.state.ezlogger.settings.autoRemoveNoise; },
      set(value) { return this.$store.commit('ezlogger/setAutoRemoveNoise', value); },
    },
    patchHyphens: {
      get() { return this.$store.state.ezlogger.settings.patchHyphens; },
      set(value) { return this.$store.commit('ezlogger/setPatchHyphens', value); },
    },
    preprod: {
      get() { return this.$store.state.ezlogger.settings.preprod; },
      set(value) { return this.$store.commit('ezlogger/setPreprod', value); },
    },
    ezpaarseUrl: {
      get() { return this.$store.state.ezlogger.settings.ezpaarseUrl; },
      set(value) { return this.$store.commit('ezlogger/setEzpaarseUrl', value); },
    },
    forceParser: {
      get() { return this.$store.state.ezlogger.settings.forceParser; },
      set(value) { return this.$store.commit('ezlogger/setForceParser', value); },
    },
  },
  watch: {
    async parserSearch(val) {
      if ((!val && !this.forceParser) || this.parsers.length > 0) { return; }
      this.loadingParsers = true;

      const ezpaarseUrl = this.getEzpaarseUrl();

      try {
        const { data } = await this.$axios.get(`${ezpaarseUrl}/info/platforms`);
        if (!Array.isArray(data)) { throw new Error('invalid response'); }
        this.parsers = data;
      } catch (e) {
        this.$store.dispatch('snacks/error', 'ezLoggerSettings.failedToFetchParsers');
      }

      this.loadingParsers = false;
    },
  },
  methods: {
    ...mapActions('ezlogger', [
      'addHeader',
      'addProxy',
      'removeHeader',
      'removeProxy',
      'saveSettings',
    ]),
    getEzpaarseUrl() {
      return this.preprod
        ? this.ezpaarseInstance
        : this.ezpaarseUrl;
    },
    filterParsers(item, queryText) {
      const search = queryText.toLowerCase();
      if (!search) { return true; }

      const { name, longname } = item;

      if (name && name.toLowerCase().includes(search)) { return true; }
      if (longname && longname.toLowerCase().includes(search)) { return true; }

      return false;
    },
    testConnection() {
      const ezpaarseUrl = this.getEzpaarseUrl();

      if (!ezpaarseUrl || this.connectionTest.loading) { return; }

      this.connectionTest.loading = true;
      this.connectionTest.errorMsg = null;
      this.connectionTest.errorMeta = null;
      this.connectionTest.version = null;

      this.$axios.get(`${ezpaarseUrl}/info/version`)
        .then((response) => {
          this.connectionTest.loading = false;

          if (response.status !== 200) {
            this.connectionTest.errorMsg = 'error_invalid_status';
            this.connectionTest.errorMeta = { status: response.status };
            return;
          }

          const body = response.data;
          const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(body);

          if (!match) {
            this.connectionTest.errorMsg = 'error_no_version';
            return;
          }

          const majorVersion = Number.parseInt(match[1], 10);
          const minorVersion = Number.parseInt(match[2], 10);

          if (majorVersion < 2 || (majorVersion === 2 && minorVersion < 9)) {
            this.connectionTest.errorMsg = 'error_version_mistmatch';
            this.connectionTest.errorMeta = { version: body };
            return;
          }

          this.connectionTest.version = body;
        }).catch((err) => {
          this.connectionTest.loading = false;

          if (err.response) {
            // Got response but status falls out of 2xx
            this.connectionTest.errorMsg = 'error_invalid_status';
            this.connectionTest.errorMeta = { status: err.response.status };
          } else if (err.request) {
            // No response
            this.connectionTest.errorMsg = 'error_no_response';
          } else {
            // Something happened
            this.connectionTest.errorMsg = 'error_generic';
          }
        });
    },
  },
};
</script>
