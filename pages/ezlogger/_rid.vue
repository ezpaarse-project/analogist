<template>
  <section>
    <v-btn flat router exact :to="{ name: 'ezlogger' }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>

    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('ezLogger.requestDetails') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-text-field
          id="url-input"
          readonly
          solo
          single-line
          full-width
          hide-details
          :value="request.url"
        >
          <template slot="prepend">
            <v-progress-circular v-if="request.status === 'processing'" indeterminate color="grey" />
            <v-icon v-else-if="request.status === 'pending'" class="grey--text">mdi-clock</v-icon>
            <v-icon v-else-if="request.status === 'analyzed'" class="green--text">mdi-lightbulb-on</v-icon>
            <v-icon v-else-if="request.status === 'rejected'" class="orange--text">mdi-lightbulb</v-icon>
            <v-icon v-else-if="request.status === 'error'" class="red--text">mdi-alert-circle-outline</v-icon>
          </template>

          <v-tooltip slot="append-outer" left>
            <v-icon slot="activator" @click="copyUrl">mdi-clipboard</v-icon>
            <span>{{ $t('ezLogger.copyToClipboard') }}</span>
          </v-tooltip>
        </v-text-field>
      </v-card-text>

      <v-card-text>
        <v-tooltip bottom v-if="request.method">
          <v-chip slot="activator" label color="blue" text-color="white">{{ request.method }}</v-chip>
          <span>{{ $t('ezLogger.requestMethod') }}</span>
        </v-tooltip>
        <v-tooltip bottom v-if="request.type">
          <v-chip slot="activator" label color="blue" text-color="white">{{ request.type }}</v-chip>
          <span>{{ $t('ezLogger.requestType') }}</span>
        </v-tooltip>
        <v-tooltip bottom v-if="request.statusCode">
          <v-chip slot="activator" label color="blue" text-color="white">{{ request.statusCode }}</v-chip>
          <span>{{ $t('ezLogger.responseStatusCode') }}</span>
        </v-tooltip>
        <v-tooltip bottom v-if="request.ec && request.ec.rtype">
          <v-chip slot="activator" label color="green" text-color="white">{{ request.ec.rtype }}</v-chip>
          <span>{{ $t('ezLogger.rtype') }}</span>
        </v-tooltip>
        <v-tooltip bottom v-if="request.ec && request.ec.mime">
          <v-chip slot="activator" label color="green" text-color="white">{{ request.ec.mime }}</v-chip>
          <span>{{ $t('ezLogger.mime') }}</span>
        </v-tooltip>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-title>
        <span class="title">{{ $t('ezLogger.consultationEvent') }}</span>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="mdi-search"
          :label="$t('ui.search')"
          single-line
          hide-details
          v-model="search"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :items="ecProps"
        hide-headers
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <th class="text-xs-left">{{ props.item.name }}</th>
          <td class="text-xs-left">{{ props.item.value }}</td>
        </template>

        <template slot="no-data">
          {{ $t('ezLogger.noData') }}
        </template>
        <template slot="no-results">
          {{ $t('ezLogger.noResults') }}
        </template>

      </v-data-table>
    </v-card>
  </section>
</template>

<script>
export default {
  name: 'request',
  transition: 'slide-x-transition',
  head () {
    return {
      title: 'ezLogger'
    }
  },
  asyncData ({ store, params, redirect }) {
    const request = store.state.ezlogger.requests.find(req => req.id === params.rid)

    if (!request) {
      return redirect({ name: 'ezlogger' })
    }

    return {
      request,
      search: ''
    }
  },

  computed: {
    ecProps () {
      const search = this.search.toLowerCase()

      return Object.entries(this.request.ec || {})
        .map(entry => ({
          name: (entry[0] || '').toString(),
          value: (entry[1] || '').toString()
        }))
        .filter(({ name, value }) => {
          return name.toLowerCase().includes(search) || value.toLowerCase().includes(search)
        })
    }
  },

  methods: {
    copyUrl () {
      try {
        document.getElementById('url-input').select()
        document.execCommand('copy')
      } catch (e) {
        return this.$store.dispatch('snacks/error', 'ezLogger.urlCopyFailed')
      }
      this.$store.dispatch('snacks/success', 'ezLogger.urlCopySuccess')
    }
  }
}
</script>
