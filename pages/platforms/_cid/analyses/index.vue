<template>
  <v-container>
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid', params: { cid: $route.params.cid } }"><v-icon>arrow_back</v-icon></v-btn>
      <v-btn v-if="canEdit" @click.native="createAnalysis" :loading="creating" flat router>Nouvelle analyse</v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-list two-line>
        <draggable v-model="analyses">
          <v-list-item v-for="analysis in analyses" v-bind:key="analysis.id">
            <v-list-tile router :href="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: analysis.id } }">
              <v-list-tile-content>
                <v-list-tile-title v-text="analysis.title" />
                <v-list-tile-sub-title>{{ analysis.rtype || '-' }} / {{ analysis.mime || '-' }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action v-if="canEdit">
                <v-btn flat icon ripple :loading="deleting[analysis.id]" @click.native.prevent="deleteAnalysis(analysis.id)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list-item>
        </draggable>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'analyses',
  components: {
    draggable
  },
  data () {
    return {
      creating: false,
      deleting: {}
    }
  },
  async fetch ({ params, store, error }) {
    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message    = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }
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
    analyses: {
      get () {
        return this.$store.state.analyses.sort((a, b) => {
          return a.order > b.order ? 1 : -1
        })
      },
      async set (list) {
        try {
          this.$store.dispatch('REORDER_ANALYSES', { cardID: this.card.id, list })
        } catch (e) {
          console.error('Reorder failed', e)
        }
      }
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    }
  },
  methods: {
    async createAnalysis () {
      this.creating = true

      try {
        const analysis = await this.$store.dispatch('SAVE_ANALYSIS', { cardID: this.card.id, analysis: {} })
        this.$router.push(`/platforms/${this.card.id}/analyses/${analysis.id}/edit`)
      } catch (e) {
        console.error('Analysis creation failed', e) // TODO: handle error
      }

      this.creating = false
    },
    async deleteAnalysis (analysisID) {
      this.$set(this.deleting, analysisID, true)

      try {
        await this.$store.dispatch('DELETE_ANALYSIS', { cardID: this.card.id, analysisID })
      } catch (e) {
        console.error('Analysis deletion failed', e) // TODO: handle error
      }

      this.$set(this.deleting, analysisID, false)
    }
  }
}
</script>
