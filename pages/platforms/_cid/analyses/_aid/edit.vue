<template>
  <section>
    <v-layout
      row
      justify-space-between
    >
      <v-btn
        text
        router
        exact
        :to="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: $route.params.aid } }"
        class="mb-2 body-2"
      >
        <v-icon left>
          mdi-arrow-left
        </v-icon>{{ $t('ui.back') }}
      </v-btn>
    </v-layout>

    <v-card>
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ card.name }}</v-toolbar-title>

        <v-btn
          absolute
          fab
          bottom
          right
          class="pink"
          :disabled="!dirty"
          :loading="saving"
          @click.native="save"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text v-if="analysis">
        <v-container
          fluid
          grid-list-md
          pa-0
        >
          <v-text-field
            v-model="analysis.title"
            filled
            name="title"
            :label="$t('analyses.title')"
            @input="handleChange"
          />
          <v-text-field
            v-model="analysis.url"
            filled
            name="url"
            :label="$t('analyses.url')"
            @input="handleChange"
            @change="parseUrl"
          />

          <v-layout wrap>
            <v-flex
              xs12
              sm6
              md4
            >
              <v-autocomplete
                v-model="analysis.rtype"
                filled
                name="rtype"
                :label="$t('analyses.type')"
                :items="rtypes"
                item-text="code"
                item-value="code"
                :filter="filterFields"
                :append-icon="analysis.rtype ? 'mdi-close' : 'mdi-menu-down'"
                @input="handleChange"
                @click:append="clearRtype"
              >
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title v-text="item.code" />
                    <v-list-item-subtitle>
                      {{ item[`description_${$i18n.locale}`] || item.description }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-flex>

            <v-flex
              xs12
              sm6
              md4
            >
              <v-autocomplete
                v-model="analysis.mime"
                filled
                name="mime"
                :label="$t('analyses.format')"
                :items="mimes"
                item-text="code"
                item-value="code"
                :filter="filterFields"
                :append-icon="analysis.mime ? 'mdi-close' : 'mdi-menu-down'"
                @input="handleChange"
                @click:append="clearMime"
              >
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title v-text="item.code" />
                    <v-list-item-subtitle>
                      {{ item[`description_${$i18n.locale}`] || item.description }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex
              xs12
              sm12
              md4
            >
              <v-text-field
                v-model="analysis.unitid"
                filled
                name="unitid"
                :label="$t('analyses.unitid')"
                @input="handleChange"
              />
            </v-flex>
          </v-layout>

          <v-textarea
            v-model="analysis.comment"
            filled
            name="comment"
            :label="$t('analyses.comment')"
            @input="handleChange"
          />
        </v-container>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.recognizedFields') }}
            <v-spacer />
            <v-btn
              color="primary"
              fab
              small
              dark
              @click.native="addEntryIn('identifiers')"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table
            v-if="analysis.identifiers && analysis.identifiers.length"
            :items="analysis.identifiers"
            hide-default-footer
          >
            <template v-slot:header>
              <tr>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.type') }}
                </th>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.value') }}
                </th>
                <th />
              </tr>
            </template>

            <template v-slot:item="{ item, index }">
              <tr>
                <td>
                  <v-autocomplete
                    v-model="item.type"
                    class="my-2"
                    :label="$t('analyses.type')"
                    :items="recognizedFields"
                    :filter="filterFields"
                    item-text="code"
                    item-value="code"
                    append-icon="mdi-menu-down"
                    single-line
                    hide-details
                    @input="handleChange"
                  >
                    <template v-slot:item="{ item: currentItem }">
                      <v-list-item-content>
                        <v-list-item-title v-text="currentItem.code" />
                        <v-list-item-subtitle>
                          {{ currentItem[`description_${$i18n.locale}`] || currentItem.description }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </td>
                <td>
                  <v-text-field
                    v-model="item.value"
                    class="my-2"
                    :label="$t('analyses.value')"
                    single-line
                    hide-details
                    @input="handleChange"
                  />
                </td>
                <td class="text-right">
                  <v-btn
                    icon
                    @click.native="removeEntryFrom('identifiers', index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.pathParams') }}
            <v-spacer />
            <v-btn
              color="primary"
              fab
              small
              dark
              @click.native="addEntryIn('pathParams')"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table
            v-if="analysis.pathParams && analysis.pathParams.length"
            :items="analysis.pathParams"
            hide-default-footer
          >
            <template v-slot:header>
              <tr>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.value') }}
                </th>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.comment') }}
                </th>
                <th />
              </tr>
            </template>

            <template v-slot:item="{ item, index }">
              <tr>
                <td>
                  <v-text-field
                    v-model="item.value"
                    class="my-2"
                    :label="$t('analyses.value')"
                    single-line
                    full-width
                    hide-details
                    @input="handleChange"
                  />
                </td>
                <td>
                  <v-text-field
                    v-model="item.comment"
                    class="my-2"
                    :label="$t('analyses.comment')"
                    single-line
                    full-width
                    hide-details
                    @input="handleChange"
                  />
                </td>
                <td class="text-right">
                  <v-btn
                    icon
                    @click.native="removeEntryFrom('pathParams', index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.queryParams') }}
            <v-spacer />
            <v-btn
              color="primary"
              fab
              small
              dark
              @click.native="addEntryIn('queryParams')"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table
            v-if="analysis.queryParams && analysis.queryParams.length"
            :items="analysis.queryParams"
            hide-default-footer
          >
            <template v-slot:header>
              <tr>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.name') }}
                </th>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.value') }}
                </th>
                <th class="text-center font-weight-regular">
                  {{ $t('analyses.comment') }}
                </th>
                <th />
              </tr>
            </template>

            <template v-slot:item="{ item, index }">
              <tr>
                <td>
                  <v-text-field
                    v-model="item.name"
                    class="my-2"
                    :label="$t('analyses.name')"
                    single-line
                    full-width
                    hide-details
                    @input="handleChange"
                  />
                </td>
                <td>
                  <v-text-field
                    v-model="item.value"
                    class="my-2"
                    :label="$t('analyses.value')"
                    single-line
                    full-width
                    hide-details
                    @input="handleChange"
                  />
                </td>
                <td>
                  <v-text-field
                    v-model="item.comment"
                    class="my-2"
                    :label="$t('analyses.comment')"
                    single-line
                    full-width
                    hide-details
                    @input="handleChange"
                  />
                </td>
                <td class="text-right">
                  <v-btn
                    icon
                    @click.native="removeEntryFrom('queryParams', index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-card-text>

      <v-card-text v-else>
        {{ $t('analyses.notFound') }}
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import api from '~/store/api'
let changeTimeout

export default {
  name: 'AnalysisEdit',
  transition: 'slide-x-transition',
  async fetch ({ params, store, error, redirect, $auth }) {
    if (!$auth.$state.user || !$auth.$state.user.isAuthorized) {
      return redirect({
        name: 'platforms-cid-analyses-aid',
        params
      })
    }

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
  async asyncData () {
    return {
      tmp: '',
      pendingChanges: false,
      dirty: false,
      saving: false,
      fields: await api.getFields()
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    analysis () {
      return this.$store.state.analysis
    },
    user () {
      return this.$auth.$state.user
    },
    canSave () {
      return this.user && this.user.isAuthorized
    },
    rtypes () {
      return this.fields.rtype.slice().sort(this.sortByCode)
    },
    mimes () {
      return this.fields.mime.slice().sort(this.sortByCode)
    },
    recognizedFields () {
      return this.fields.rid.concat(this.fields.other).sort(this.sortByCode)
    }
  },
  mounted () {
    this.$socket.emit('ADD_TO_ROOM', { userId: this.user.id })
  },
  methods: {
    sortByCode (a, b) {
      return a.code.toLowerCase() > b.code.toLowerCase() ? 1 : -1
    },
    clearMime (event) {
      this.analysis.mime = null
      this.handleChange()
    },
    clearRtype (event) {
      this.analysis.rtype = null
      this.handleChange()
    },
    addEntryIn (arrayName) {
      if (!Array.isArray(this.analysis[arrayName])) {
        this.$set(this.analysis, arrayName, [])
      }

      this.analysis[arrayName].push({})
    },
    removeEntryFrom (arrayName, index) {
      this.analysis[arrayName].splice(index, 1)
      this.handleChange()
    },
    handleChange () {
      clearTimeout(changeTimeout)
      this.dirty = true
      if (this.saving) {
        this.pendingChanges = true
      }
      changeTimeout = setTimeout(this.save, 5000)
    },
    filterFields (item, search) {
      if (typeof search !== 'string') { return true }
      search = search.toLowerCase()

      if (item.code && item.code.toLowerCase().includes(search)) {
        return true
      }
      if (item.description && item.description.toLowerCase().includes(search)) {
        return true
      }

      return false
    },
    parseUrl () {
      if (!this.analysis || !this.analysis.url) { return }

      this.analysis.pathParams = this.analysis.pathParams || []
      this.analysis.queryParams = this.analysis.queryParams || []

      if (this.analysis.pathParams.length > 0) { return }
      if (this.analysis.queryParams.length > 0) { return }

      const link = document.createElement('a')
      link.href = this.analysis.url

      link.pathname.split('/').forEach(param => {
        if (param) { this.analysis.pathParams.push({ value: param }) }
      })

      link.search.substring(1).split('&').forEach(param => {
        if (!param) { return }

        const parts = param.split('=')

        this.analysis.queryParams.push({
          name: decodeURIComponent(parts[0] || ''),
          value: decodeURIComponent(parts[1] || '')
        })
      })
    },
    async save () {
      if (!this.dirty) { return }
      if (this.saving) { return }

      clearTimeout(changeTimeout)
      this.saving = true

      try {
        do {
          this.pendingChanges = false

          await this.$store.dispatch('SAVE_ANALYSIS', {
            cardID: this.card.id,
            analysis: this.analysis
          })
        } while (this.pendingChanges)

        if (this.card.idMembers.indexOf(this.user.id) === -1) {
          await this.$store.dispatch('ADD_CARD_MEMBER', {
            card: this.card,
            user: this.user
          })
        }

        this.dirty = false
        this.saving = false
        this.$emit('saved')
        this.$store.dispatch('snacks/success', 'analyses.saved')
      } catch (e) {
        this.saving = false
        this.pendingChanges = false
        this.$store.dispatch('snacks/error', 'analyses.saveFailed')
      }
    }
  },
  head () {
    return {
      title: `Analyses: ${this.card.name}`
    }
  },
  beforeRouteLeave (to, from, next) {
    clearTimeout(changeTimeout)
    if (!this.dirty && !this.saving) { return next() }

    this.$once('saved', next)

    if (this.dirty && this.saving) {
      this.pendingChanges = true
    } else {
      this.save()
    }
  }
}
</script>
