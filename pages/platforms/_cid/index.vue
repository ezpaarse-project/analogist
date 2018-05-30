<template>
  <section>
    <v-layout row justify-space-between>
      <v-btn flat router exact :to="{ path: '/' }"><v-icon left>mdi-arrow-left</v-icon>{{ $t('ui.back') }}</v-btn>
    </v-layout>

    <v-card>
      <v-toolbar class="secondary" dark dense card>
        <v-toolbar-title>
          {{ card.name }}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <v-btn icon slot="activator" v-if="canEdit" @click="createAnalysis"><v-icon>mdi-plus</v-icon></v-btn>
          <span>{{ $t('analyses.new') }}</span>
        </v-tooltip>

        <v-menu>
          <v-btn slot="activator" icon dark>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile avatar v-if="card.members.length > 0" @click="membersDialog = true">
              <v-list-tile-avatar>
                <v-icon>mdi-account-multiple</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('card.contributors') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar v-if="card.githubUrl" :href="card.githubUrl" target="_blank">
              <v-list-tile-avatar>
                <v-icon>mdi-github-box</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('card.github') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar v-if="card.homeUrl" :href="card.homeUrl" target="_blank">
              <v-list-tile-avatar>
                <v-icon>mdi-home</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('card.homepage') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar v-if="card.url" :href="card.url" target="_blank">
              <v-list-tile-avatar>
                <v-icon>mdi-trello</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('card.trello') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider></v-divider>

            <v-list-tile avatar @click="generateTestFile">
              <v-list-tile-avatar>
                <v-icon>mdi-upload</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('analyses.export') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar @click="deleteDialog = true">
              <v-list-tile-avatar>
                <v-icon>mdi-archive</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('card.archive') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>

      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12 sm4>
            <div>{{ $t('card.lastActivity') }}</div>
            <strong>{{ lastActivity }}</strong>
          </v-flex>

          <v-flex xs12 sm8>
            <v-select
              v-if="canEdit"
              :items="trelloLists"
              :label="$t('card.status')"
              :disabled="movingCard"
              :loading="movingCard"
              :value="card.idList"
              @input="onListChange"
              append-icon="mdi-menu-down"
              item-text="name"
              item-value="id"
              hide-details
            ></v-select>

            <template v-else>
              <div>{{ $t('card.status') }}</div>
              <strong v-if="list">{{ list.name }}</strong>
              <strong v-else>{{ $t('card.unknown') }}</strong>
            </template>
          </v-flex>
        </v-layout>
      </v-card-text>


      <template v-if="card.humanCertified || card.publisherCertified">
        <v-divider/>
        <v-subheader>Certifications</v-subheader>

        <v-list>
          <v-list-tile v-if="card.humanCertified" avatar href="http://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">
            <v-list-tile-avatar>
              <img src="~/assets/img/certif_h.png">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ $t('card.manuallyVerified') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile v-if="card.publisherCertified" avatar href="http://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">
            <v-list-tile-avatar>
              <img src="~/assets/img/certif_p.png">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ $t('card.publisherVerified') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-divider/>
      </template>

      <v-divider/>

      <v-list two-line>
        <draggable v-model="analyses">
          <AnalysisTile v-for="analysis in analyses" :key="analysis.id" :analysis="analysis" :cardID="card.id"/>
        </draggable>
      </v-list>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">{{ $t('ui.areYouSure') }}</v-card-title>

        <v-card-text>
          {{ $t('card.archiveDesc') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" :loading="deletingCard" @click.native="archivePlatform">{{ $t('ui.archive') }}</v-btn>
          <v-btn color="secondary" @click.native="deleteDialog = false">{{ $t('ui.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="membersDialog" max-width="600">
      <v-card>
        <v-card-title class="headline">
          <span>{{ $t('card.contributors') }}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="membersDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-list>
          <v-list-tile v-for="member in card.members" v-bind:key="member.id" avatar :href="'https://trello.com/' + member.username">
            <v-list-tile-avatar>
              <img v-if="member.avatarHash" :src="'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/50.png'" alt="avatar">
              <span v-else class="icon blue-grey lighten-4">{{ member.initials }}</span>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title v-text="member.fullName" />
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import moment from 'moment'
import AnalysisTile from '~/components/AnalysisTile'
import draggable from 'vuedraggable'
import { saveAs } from 'file-saver'

function escapeCSVstring (str) {
  if (/[";]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  } else {
    return str || ''
  }
}

export default {
  name: 'platform',
  transition: 'slide-x-transition',
  components: {
    AnalysisTile,
    draggable
  },
  async fetch ({ params, store, error }) {
    await store.dispatch('FETCH_TRELLO_LISTS')

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
      title: `Platform: ${this.card.name}`
    }
  },
  data () {
    return {
      membersDialog: false,
      deleteDialog: false,
      deletingCard: false,
      movingCard: false
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
          await this.$store.dispatch('REORDER_ANALYSES', { cardID: this.card.id, list })
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
    },
    list () {
      return this.$store.state.trelloLists.find(l => this.card.idList === l.id)
    },
    trelloLists () {
      return this.$store.state.trelloLists
    },
    lastActivity () {
      return moment(this.card.lastActivity).locale(this.$i18n.locale).fromNow()
    }
  },
  methods: {
    async onListChange (idList) {
      if (!this.canEdit) { return }
      this.movingCard = true

      try {
        await this.$store.dispatch('MOVE_CARD', { card: this.card, listID: idList })
        this.card.idList = idList
      } catch (e) {
        // eslint-disable-next-line
        console.error('List update failed', e)
        // TODO: handle error
      }

      this.movingCard = false
    },
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
    async archivePlatform () {
      this.deletingCard = true

      try {
        await this.$store.dispatch('ARCHIVE_CARD', this.card.id)
        this.deleteDialog = false
        this.$router.push('/')
      } catch (e) {
        // eslint-disable-next-line
        console.error('Platform deletion failed', e)
        // TODO: handle error
      }

      this.deletingCard = false
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
