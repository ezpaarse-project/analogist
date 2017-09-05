<template>
  <section>
    <v-btn flat router exact :to="{ name: 'platforms-cid', params: { cid: $route.params.cid } }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>

    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ card.name }}
        </v-toolbar-title>

        <v-spacer/>

        <v-btn icon @click.native="generateTestFile" v-tooltip:left="{ html: $t('analyses.export') }">
          <v-icon>mdi-upload</v-icon>
        </v-btn>

        <v-btn icon v-if="canEdit" @click.native="createAnalysis" v-tooltip:left="{ html: $t('analyses.new') }">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-list two-line>
        <draggable v-model="analyses">
          <AnalysisTile v-for="analysis in analyses" :key="analysis.id" :analysis="analysis" :cardID="card.id"/>
        </draggable>
      </v-list>
    </v-card>
  </section>
</template>

<script>
import AnalysisTile from '~/components/AnalysisTile'
import draggable from 'vuedraggable'
import moment from 'moment'
import { saveAs } from 'file-saver'

function escapeCSVstring (str) {
  if (/[";]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  } else {
    return str || ''
  }
}

export default {
  name: 'analyses',
  transition: 'slide-x-transition',
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
          // eslint-disable-next-line
          console.error('Reorder failed', e)
          // TODO: handle error
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
        // eslint-disable-next-line
        console.error('Analysis creation failed', e)
        // TODO: handle error
      }

      this.creating = false
    },
    generateTestFile () {
      if (!this.analyses) { return }

      const columns = [
        { title: 'out-unitid', getter (a) { return a.unitid } },
        { title: 'out-rtype', getter (a) { return a.rtype } },
        { title: 'out-mime', getter (a) { return a.mime } },
        { title: 'in-url', getter (a) { return a.url } }
      ]

      // Add a column for each identifier
      this.analyses.forEach(analysis => {
        if (!analysis.identifiers) { return }

        analysis.identifiers.forEach(id => {
          if (!id.type) { return }
          if (columns.find(c => c.title === `out-${id.type}`)) { return }

          columns.unshift({
            title: `out-${id.type}`,
            getter (a) {
              if (a.identifiers) {
                const identifier = a.identifiers.find(i => i.type === id.type)
                return identifier && identifier.value
              }
            }
          })
        })
      })

      const header = columns.map(col => escapeCSVstring(col.title)).join(';')

      const lines = this.analyses.map(analysis => {
        return columns.map(col => escapeCSVstring(col.getter(analysis))).join(';')
      }).join('\n')

      const shortName = (/\[([\w\d]+)\]$/.exec(this.card && this.card.name) || [])[1]
      const fileName = `${shortName || 'test'}.${moment().format('YYYY-MM-DD')}.csv`

      saveAs(new Blob([`${header}\n${lines}`], { type: 'text/csv;charset=utf-8' }), fileName)
    }
  }
}
</script>
