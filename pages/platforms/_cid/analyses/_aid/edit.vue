<template>
  <section>
    <v-layout row justify-space-between>
      <v-btn flat router exact :to="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: $route.params.aid } }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>
    </v-layout>

    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ card.name }}
        </v-toolbar-title>

        <v-btn absolute fab bottom right class="pink" :disabled="!dirty" :loading="saving" v-on:click.native="save">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text v-if="analysis">
        <v-container fluid grid-list-md>
          <v-text-field @input="handleChange" name="title" :label="$t('analyses.title')" v-model="analysis.title"></v-text-field>
          <v-text-field @input="handleChange" @change="parseUrl" name="url" :label="$t('analyses.url')" v-model="analysis.url"></v-text-field>

          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-autocomplete
                name="rtype"
                :label="$t('analyses.type')"
                :items="rtypes"
                item-text="code"
                item-value="code"
                :filter="filterFields"
                @input="handleChange"
                v-model="analysis.rtype"
                :append-icon="analysis.rtype ? 'mdi-close' : 'mdi-menu-down'"
                @click:append="clearRtype"
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.code"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.item.description"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </v-autocomplete>
            </v-flex>

            <v-flex xs12 sm6 md4>
              <v-autocomplete
                name="mime"
                :label="$t('analyses.format')"
                :items="mimes"
                item-text="code"
                item-value="code"
                :filter="filterFields"
                @input="handleChange"
                v-model="analysis.mime"
                :append-icon="analysis.mime ? 'mdi-close' : 'mdi-menu-down'"
                @click:append="clearMime"
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.code"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.item.description"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex xs12 sm12 md4>
              <v-text-field @input="handleChange" name="unitid" :label="$t('analyses.unitid')" v-model="analysis.unitid"></v-text-field>
            </v-flex>
          </v-layout>

          <v-textarea @input="handleChange" outline name="comment" :label="$t('analyses.comment')" v-model="analysis.comment"></v-textarea>
        </v-container>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.recognizedFields') }}
            <v-spacer/>
            <v-btn color="primary" fab small dark v-on:click.native="addEntryIn('identifiers')">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table v-if="analysis.identifiers && analysis.identifiers.length"
            :items="analysis.identifiers"
            hide-actions
          >
            <template slot="headers" slot-scope="props">
              <tr>
                <th>{{ $t('analyses.type') }}</th>
                <th>{{ $t('analyses.value') }}</th>
                <th></th>
              </tr>
            </template>

            <template slot="items" slot-scope="props">
              <td>
                <v-autocomplete
                  :label="$t('analyses.type')"
                  :items="recognizedFields"
                  :filter="filterFields"
                  v-model="props.item.type"
                  @input="handleChange"
                  item-text="code"
                  item-value="code"
                  append-icon="mdi-menu-down"
                  single-line
                >
                  <template slot="item" slot-scope="data">
                    <v-list-tile-content>
                      <v-list-tile-title v-html="data.item.code"></v-list-tile-title>
                      <v-list-tile-sub-title v-html="data.item.description"></v-list-tile-sub-title>
                    </v-list-tile-content>
                  </template>
                </v-autocomplete>
              </td>
              <td>
                <v-text-field
                  v-model="props.item.value"
                  @input="handleChange"
                  :label="$t('analyses.value')"
                  single-line
                  full-width
                  hide-details
                />
              </td>
              <td class="text-xs-right">
                <v-btn icon v-on:click.native="removeEntryFrom('identifiers', props.index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.pathParams') }}
            <v-spacer/>
            <v-btn color="primary" fab small dark v-on:click.native="addEntryIn('pathParams')">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table v-if="analysis.pathParams && analysis.pathParams.length"
            :items="analysis.pathParams"
            hide-actions
          >
            <template slot="headers" slot-scope="props">
              <tr>
                <th>{{ $t('analyses.value') }}</th>
                <th>{{ $t('analyses.comment') }}</th>
                <th></th>
              </tr>
            </template>

            <template slot="items" slot-scope="props">
              <td>
                <v-text-field
                  v-model="props.item.value"
                  @input="handleChange"
                  :label="$t('analyses.value')"
                  single-line
                  full-width
                  hide-details
                />
              </td>
              <td>
                <v-text-field
                  v-model="props.item.comment"
                  @input="handleChange"
                  :label="$t('analyses.comment')"
                  single-line
                  full-width
                  hide-details
                />
              </td>
              <td class="text-xs-right">
                <v-btn icon v-on:click.native="removeEntryFrom('pathParams', props.index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.queryParams') }}
            <v-spacer/>
            <v-btn color="primary" fab small dark v-on:click.native="addEntryIn('queryParams')">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table v-if="analysis.queryParams && analysis.queryParams.length"
            :items="analysis.queryParams"
            hide-actions
          >
            <template slot="headers" slot-scope="props">
              <tr>
                <th>{{ $t('analyses.name') }}</th>
                <th>{{ $t('analyses.value') }}</th>
                <th>{{ $t('analyses.comment') }}</th>
                <th></th>
              </tr>
            </template>

            <template slot="items" slot-scope="props">
              <td>
                <v-text-field
                  v-model="props.item.name"
                  @input="handleChange"
                  :label="$t('analyses.name')"
                  single-line
                  full-width
                  hide-details
                />
              </td>
              <td>
                <v-text-field
                  v-model="props.item.value"
                  @input="handleChange"
                  :label="$t('analyses.value')"
                  single-line
                  full-width
                  hide-details
                />
              </td>
              <td>
                <v-text-field
                  v-model="props.item.comment"
                  @input="handleChange"
                  :label="$t('analyses.comment')"
                  single-line
                  full-width
                  hide-details
                />
              </td>
              <td class="text-xs-right">
                <v-btn icon v-on:click.native="removeEntryFrom('queryParams', props.index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
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
  name: 'analysis-edit',
  transition: 'slide-x-transition',
  async asyncData () {
    return {
      tmp: '',
      pendingChanges: false,
      dirty: false,
      saving: false,
      fields: await api.getFields()
    }
  },
  async fetch ({ params, store, error, redirect }) {
    if (!store.state.user || !store.state.user.isAuthorized) {
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
    store.dispatch('SET_VISITED_ANALYSIS', params.aid)
  },
  head () {
    return {
      title: `Analyses: ${this.card.name}`
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
      return this.$store.state.user
    },
    canSave () {
      return this.user && this.user.isAuthorized
    },
    rtypes () {
      return this.fields.rtype.sort(this.sortByCode)
    },
    mimes () {
      return this.fields.mime.sort(this.sortByCode)
    },
    recognizedFields () {
      return this.fields.rid.concat(this.fields.other).sort(this.sortByCode)
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
  mounted() {
    this.$socket.emit('ON_ANALYSIS_EDITION', { userId : this.user.id })
    
    this.$socket.on('BADGE_EMITTED', (data) => {
      if (data.emitted) this.$store.dispatch('snacks/success', 'badges.emitted')
    })
  }
}
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }
</style>