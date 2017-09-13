<template>
  <section>
    <v-layout row justify-space-between>
      <v-btn flat router exact router :to="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: $route.params.aid } }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>
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
              <v-select
                name="rtype"
                :label="$t('analyses.type')"
                :items="fields.rtype"
                item-text="code"
                item-value="code"
                :filter="filterFields"
                @input="handleChange"
                v-model="analysis.rtype"
                :append-icon="analysis.rtype ? 'mdi-close' : 'mdi-menu-down'"
                :append-icon-cb="clearRtype"
                autocomplete
              >
                <template slot="item" scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.code"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.item.description"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-flex>

            <v-flex xs12 sm6 md4>
              <v-select
                name="mime"
                :label="$t('analyses.format')"
                :items="fields.mime"
                item-text="code"
                item-value="code"
                :filter="filterFields"
                @input="handleChange"
                v-model="analysis.mime"
                :append-icon="analysis.mime ? 'mdi-close' : 'mdi-menu-down'"
                :append-icon-cb="clearMime"
                autocomplete
              >
                <template slot="item" scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.code"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.item.description"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-flex>
            <v-flex xs12 sm12 md4>
              <v-text-field @input="handleChange" name="unitid" :label="$t('analyses.unitid')" v-model="analysis.unitid"></v-text-field>
            </v-flex>
          </v-layout>

          <v-text-field @input="handleChange" multi-line name="comment" :label="$t('analyses.comment')" v-model="analysis.comment"></v-text-field>
        </v-container>

        <v-card class="my-3">
          <v-card-title class="headline">
            {{ $t('analyses.recognizedFields') }}
            <v-spacer/>
            <v-btn primary fab small dark v-on:click.native="addEntryIn('identifiers')">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table v-if="analysis.identifiers.length"
            :items="analysis.identifiers"
            hide-actions
          >
            <template slot="headers" scope="props">
              <tr class="text-xs-left">
                <th>{{ $t('analyses.type') }}</th>
                <th>{{ $t('analyses.value') }}</th>
              </tr>
            </template>

            <template slot="items" scope="props">
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.type"
                  @save="$set(props.item, 'type', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.type">{{ props.item.type }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.type') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    v-model="tmp"
                    single-line
                  />
                </v-edit-dialog>
              </td>
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.value"
                  @save="$set(props.item, 'value', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.value">{{ props.item.value }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.value') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    single-line
                    v-model="tmp"
                  />
                </v-edit-dialog>
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
            <v-btn primary fab small dark v-on:click.native="addEntryIn('pathParams')">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table v-if="analysis.pathParams.length"
            :items="analysis.pathParams"
            hide-actions
          >
            <template slot="headers" scope="props">
              <tr class="text-xs-left">
                <th>{{ $t('analyses.value') }}</th>
                <th>{{ $t('analyses.comment') }}</th>
              </tr>
            </template>

            <template slot="items" scope="props">
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.value"
                  @save="$set(props.item, 'value', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.value">{{ props.item.value }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.value') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    single-line
                    v-model="tmp"
                  />
                </v-edit-dialog>
              </td>
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.comment"
                  @save="$set(props.item, 'comment', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.comment">{{ props.item.comment }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.comment') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    v-model="tmp"
                    single-line
                  />
                </v-edit-dialog>
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
            <v-btn primary fab small dark v-on:click.native="addEntryIn('queryParams')">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table v-if="analysis.queryParams.length"
            :items="analysis.queryParams"
            hide-actions
          >
            <template slot="headers" scope="props">
              <tr class="text-xs-left">
                <th>{{ $t('analyses.name') }}</th>
                <th>{{ $t('analyses.value') }}</th>
                <th>{{ $t('analyses.comment') }}</th>
              </tr>
            </template>

            <template slot="items" scope="props">
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.name"
                  @save="$set(props.item, 'name', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.name">{{ props.item.name }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.name') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    single-line
                    v-model="tmp"
                  />
                </v-edit-dialog>
              </td>
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.value"
                  @save="$set(props.item, 'value', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.value">{{ props.item.value }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.value') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    single-line
                    v-model="tmp"
                  />
                </v-edit-dialog>
              </td>
              <td>
                <v-edit-dialog
                  @open="tmp = props.item.comment"
                  @save="$set(props.item, 'comment', tmp); handleChange()"
                  lazy
                  large
                >
                  <span v-if="props.item.comment">{{ props.item.comment }}</span>
                  <span v-else class="grey--text">{{ $t('analyses.comment') }}</span>
                  <v-text-field
                    slot="input"
                    label="Edit"
                    v-model="tmp"
                    single-line
                  />
                </v-edit-dialog>
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

    <v-snackbar :timeout="1000" bottom right v-model="saved">
      {{ $t('analyses.saved') }}
    </v-snackbar>

    <v-snackbar bottom right v-model="error">
      {{ error }}
    </v-snackbar>
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
      saved: false,
      error: null,
      fields: await api.getFields()
    }
  },
  async fetch ({ params, store, error, redirect }) {
    if (!store.state.user || !store.state.user.isAuthorized) {
      return redirect(`/platforms/${params.cid}/analyses/${params.aid}`)
    }

    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message    = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }

    store.dispatch('GET_ANALYSIS', params.aid)
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
    clearMime (event) {
      this.analysis.mime = null
      this.handleChange()
      event.stopPropagation()
    },
    clearRtype (event) {
      this.analysis.rtype = null
      this.handleChange()
      event.stopPropagation()
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
      changeTimeout = setTimeout(this.save, 2000)
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

        this.saved = true
        this.dirty = false
        this.saving = false
        this.$emit('saved')
      } catch (e) {
        this.error = e
        this.saving = false
        this.pendingChanges = false
        // eslint-disable-next-line
        return console.error(e)
        // TODO: handle error
      }
    }
  }
}
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }
</style>