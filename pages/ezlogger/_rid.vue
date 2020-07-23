<template>
  <section>
    <v-btn
      text
      router
      exact
      :to="{ name: 'ezlogger' }"
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
          <template v-slot:prepend>
            <v-progress-circular
              v-if="request.status === 'processing'"
              indeterminate
              color="grey"
            />
            <v-icon
              v-else-if="request.status === 'pending'"
              class="grey--text"
            >
              mdi-clock
            </v-icon>
            <v-icon
              v-else-if="request.status === 'analyzed'"
              class="green--text"
            >
              mdi-lightbulb-on
            </v-icon>
            <v-icon
              v-else-if="request.status === 'rejected'"
              class="orange--text"
            >
              mdi-lightbulb
            </v-icon>
            <v-icon
              v-else-if="request.status === 'error'"
              class="red--text"
            >
              mdi-alert-circle-outline
            </v-icon>
          </template>

          <v-tooltip
            slot="append-outer"
            left
          >
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                @click="copyUrl"
              >
                mdi-clipboard
              </v-icon>
            </template>
            <span>{{ $t('ezLogger.copyToClipboard') }}</span>
          </v-tooltip>
        </v-text-field>
      </v-card-text>

      <v-card-text>
        <v-tooltip
          v-if="request.method"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-chip
              label
              color="blue"
              text-color="white"
              v-on="on"
            >
              {{ request.method }}
            </v-chip>
          </template>
          <span>{{ $t('ezLogger.requestMethod') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="request.type"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-chip
              label
              color="blue"
              text-color="white"
              v-on="on"
            >
              {{ request.type }}
            </v-chip>
          </template>
          <span>{{ $t('ezLogger.requestType') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="request.statusCode"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-chip
              label
              color="blue"
              text-color="white"
              v-on="on"
            >
              {{ request.statusCode }}
            </v-chip>
          </template>
          <span>{{ $t('ezLogger.responseStatusCode') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="request.ec && request.ec.rtype"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-chip
              label
              color="green"
              text-color="white"
              v-on="on"
            >
              {{ request.ec.rtype }}
            </v-chip>
          </template>
          <span>{{ $t('ezLogger.rtype') }}</span>
        </v-tooltip>
        <v-tooltip
          v-if="request.ec && request.ec.mime"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-chip
              label
              color="green"
              text-color="white"
              v-on="on"
            >
              {{ request.ec.mime }}
            </v-chip>
          </template>
          <span>{{ $t('ezLogger.mime') }}</span>
        </v-tooltip>
      </v-card-text>

      <v-divider />

      <v-card-title>
        <span class="title">{{ $t('ezLogger.consultationEvent') }}</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-search"
          :label="$t('ui.search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :items="ecProps"
        hide-default-headers
        hide-default-footer
        disable-pagination
      >
        <template v-slot:body="{ items }">
          <tr
            v-for="(item, index) in items"
            :key="index"
          >
            <th class="text-left px-5 py-2">
              {{ item.name }}
            </th>
            <td class="text-left">
              {{ item.value }}
            </td>
          </tr>
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
  name: 'Request',
  transition: 'slide-x-transition',
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
  },
  head () {
    return {
      title: 'ezLogger'
    }
  }
}
</script>
