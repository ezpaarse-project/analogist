<template>
  <v-dialog
    :value="value"
    max-width="900px"
    @input="setVisible($event)"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5" v-text="$t('ezLogger.requestDetails')" />

        <v-spacer />

        <v-btn
          text
          @click="setVisible(false)"
        >
          {{ $t('ui.close') }}
        </v-btn>
      </v-card-title>

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
          <template #prepend>
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
            <template #activator="{ on }">
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
          <template #activator="{ on }">
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
          <template #activator="{ on }">
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
          <template #activator="{ on }">
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
          <template #activator="{ on }">
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
          <template #activator="{ on }">
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
        <template #item="{ item }">
          <tr>
            <th class="text-left">
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
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      request: {},
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
    showDetail (req) {
      if (req) {
        this.request = req
        this.setVisible(true)
      }
    },

    setVisible (value) {
      this.$emit('input', value)
    },

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
