<template>
  <v-container>
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid', params: { cid: $route.params.cid } }"><v-icon>arrow_back</v-icon></v-btn>
      <v-btn v-if="canEdit" @click.native="createAnalysis" :loading="creating" flat router>{{ $t('analyses.new') }}</v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-list two-line>
        <draggable v-model="analyses">
          <AnalysisTile v-for="analysis in analyses" :key="analysis.id" :analysis="analysis" :cardID="card.id"/>
        </draggable>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import AnalysisTile from '~/components/AnalysisTile'
import draggable from 'vuedraggable'

export default {
  name: 'analyses',
  components: {
    draggable,
    AnalysisTile
  },
  data () {
    return {
      creating: false
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
      title: this.card.name
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
        if (!this.canEdit) { return }

        try {
          this.$store.dispatch('REORDER_ANALYSES', { cardID: this.card.id, list })
        } catch (e) {
          console.error('Reorder failed', e)
        }
      }
    },
    user () {
      return this.$store.state.user
    },
    canEdit () {
      return this.user && this.user.isAuthorized
    }
  },
  methods: {
    async createAnalysis () {
      this.creating = true

      try {
        const analysis = await this.$store.dispatch('SAVE_ANALYSIS', { cardID: this.card.id, analysis: {} })

        if (this.card.idMembers.indexOf(this.user.id) === -1) {
          await this.$store.dispatch('ADD_CARD_MEMBER', {
            card: this.card,
            user: this.user
          })
        }

        this.$router.push(`/platforms/${this.card.id}/analyses/${analysis.id}/edit`)
      } catch (e) {
        console.error('Analysis creation failed', e) // TODO: handle error
      }

      this.creating = false
    }
  }
}
</script>
