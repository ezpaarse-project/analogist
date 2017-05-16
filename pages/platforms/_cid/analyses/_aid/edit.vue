<template>
  <v-container v-if="analysis">
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: $route.params.aid } }"><v-icon>arrow_back</v-icon></v-btn>
      <v-btn class="blue" :disabled="!dirty" :loading="saving" v-on:click.native="save"><v-icon>save</v-icon></v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-card-text>
        <v-container fluid>
          <v-text-field @input="handleChange" name="title" :label="$t('analyses.title')" v-model="analysis.title"></v-text-field>
          <v-text-field @input="handleChange" name="url" :label="$t('analyses.url')" v-model="analysis.url"></v-text-field>

          <v-row>
            <v-col xs12 sm6 md4>
              <v-text-field @input="handleChange" name="rtype" :label="$t('analyses.type')" v-model="analysis.rtype"></v-text-field>
            </v-col>
            <v-col xs12 sm6 md4>
              <v-text-field @input="handleChange" name="mime" :label="$t('analyses.format')" v-model="analysis.mime"></v-text-field>
            </v-col>
            <v-col xs12 sm12 md4>
              <v-text-field @input="handleChange" name="unitid" :label="$t('analyses.unitid')" v-model="analysis.unitid"></v-text-field>
            </v-col>
          </v-row>

          <v-text-field @input="handleChange" multi-line name="comment" :label="$t('analyses.comment')" v-model="analysis.comment"></v-text-field>

          <h4>{{ $t('analyses.recognizedFields') }}</h4>
          <v-row class="elevation-1 my-2" v-for="(id, index) in analysis.identifiers" :key="index">
            <v-col xs12 sm5 md5>
              <v-text-field @input="handleChange" :label="$t('analyses.type')" v-model="id.type"></v-text-field>
            </v-col>
            <v-col xs12 sm5 md6>
              <v-text-field @input="handleChange" :label="$t('analyses.value')" v-model="id.value"></v-text-field>
            </v-col>
            <v-col xs12 sm2 md1 class="text-xs-center">
              <v-btn secondary floating small v-on:click.native="removeEntryFrom('identifiers', index)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <p class="text-xs-center">
            <v-btn primary floating small dark v-on:click.native="addEntryIn('identifiers')">
              <v-icon>add</v-icon>
            </v-btn>
          </p>

          <h4>{{ $t('analyses.pathParams') }}</h4>
          <v-row class="elevation-1 my-2" v-for="(id, index) in analysis.pathParams" :key="index">
            <v-col xs12 sm5 md5>
              <v-text-field @input="handleChange" :label="$t('analyses.title')" v-model="id.value"></v-text-field>
            </v-col>
            <v-col xs12 sm5 md6>
              <v-text-field @input="handleChange" :label="$t('analyses.title')" v-model="id.comment"></v-text-field>
            </v-col>
            <v-col xs12 sm2 md1 class="text-xs-center">
              <v-btn secondary floating small v-on:click.native="removeEntryFrom('pathParams', index)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <p class="text-xs-center">
            <v-btn primary floating small dark v-on:click.native="addEntryIn('pathParams')">
              <v-icon>add</v-icon>
            </v-btn>
          </p>

          <h4>{{ $t('analyses.queryParams') }}</h4>
          <v-row class="elevation-1 my-2" v-for="(id, index) in analysis.queryParams" :key="index">
            <v-col xs12 sm6 md3>
              <v-text-field @input="handleChange" :label="$t('analyses.name')" v-model="id.name"></v-text-field>
            </v-col>
            <v-col xs12 sm6 md4>
              <v-text-field @input="handleChange" :label="$t('analyses.value')" v-model="id.value"></v-text-field>
            </v-col>
            <v-col xs12 sm10 md4>
              <v-text-field @input="handleChange" :label="$t('analyses.comment')" v-model="id.comment"></v-text-field>
            </v-col>
            <v-col xs12 sm2 md1 class="text-xs-center">
              <v-btn secondary floating small v-on:click.native="removeEntryFrom('queryParams', index)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <p class="text-xs-center">
            <v-btn primary floating small dark v-on:click.native="addEntryIn('queryParams')">
              <v-icon>add</v-icon>
            </v-btn>
          </p>
        </v-container>
      </v-card-text>
    </v-card>

    <v-snackbar :timeout="1000" bottom right v-model="saved">
      {{ $t('analyses.saved') }}
    </v-snackbar>

    <v-snackbar bottom right v-model="error">
      {{ error }}
    </v-snackbar>
  </v-container>

  <v-container v-else>
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid-analyses', params: { cid: card.id } }"><v-icon>arrow_back</v-icon></v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-card-text>
        {{ $t('analyses.notFound') }}
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
let changeTimeout

export default {
  name: 'analysis-edit',
  data () {
    return {
      pendingChanges: false,
      dirty: false,
      saving: false,
      saved: false,
      error: null
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