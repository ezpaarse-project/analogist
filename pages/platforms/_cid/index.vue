<template>
  <section>
    <v-layout>
      <v-btn
        text
        router
        exact
        :to="{ path: '/platforms' }"
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
        dark
        dense
        elevation="0"
      >
        <v-toolbar-title>
          <v-tooltip
            v-if="card.closed"
            right
          >
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <v-icon
                  size="24"
                  class="mb-1"
                >mdi-archive</v-icon>
                {{ card.name }}
              </span>
            </template>
            <span v-text="$t('card.archived')" />
          </v-tooltip>
          <span
            v-else
            v-text="card.name"
          />
        </v-toolbar-title>

        <v-spacer />

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="canEdit"
              icon
              v-on="on"
              @click="createAnalysis"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('analyses.new') }}</span>
        </v-tooltip>

        <v-menu
          left
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              small
              v-on="on"
            >
              {{ $t('card.menu') }}
              <v-icon right>
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item-group>
              <v-list-item
                v-if="card.members.length > 0"
                @click="membersDialog = true"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-account-multiple</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('card.contributors')" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="card.githubUrl"
                :href="card.githubUrl"
                target="_blank"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-github</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('card.github')" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="card.homeUrl"
                :href="card.homeUrl"
                target="_blank"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-home</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('card.homepage')" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="card.url"
                :href="card.url"
                target="_blank"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-trello</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('card.trello')" />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>

            <v-divider />

            <v-list-item-group>
              <v-list-item @click="generateTestFile">
                <v-list-item-avatar>
                  <v-icon>mdi-upload</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('analyses.export')" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="exportToEzlogger">
                <v-list-item-avatar>
                  <v-icon>mdi-file-find</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('analyses.testWithEzlogger')" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="canEdit && !card.closed"
                @click="deleteDialog = true"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-archive-arrow-down</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('card.archive')" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="canEdit && card.closed"
                @click="deleteDialog = true"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-archive-arrow-up</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="$t('card.unarchive')" />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </v-toolbar>

      <v-card-text>
        <v-layout
          row
          wrap
          class="pl-3 pr-3"
        >
          <v-flex
            xs12
            sm4
          >
            <div class="font-weight-regular">
              {{ $t('card.lastActivity') }}
            </div>
            <div class="font-weight-medium">
              {{ lastActivity }}
            </div>
          </v-flex>

          <v-flex
            xs12
            sm8
          >
            <v-select
              v-if="canEdit"
              :items="trelloLists"
              :label="$t('card.status')"
              :disabled="movingCard"
              :loading="movingCard"
              :value="card.idList"
              append-icon="mdi-menu-down"
              item-text="name"
              item-value="id"
              hide-details
              @input="onListChange"
            />

            <template v-else>
              <div>{{ $t('card.status') }}</div>
              <strong v-if="list">{{ list.name }}</strong>
              <strong v-else>{{ $t('card.unknown') }}</strong>
            </template>
          </v-flex>
        </v-layout>
      </v-card-text>

      <template>
        <v-divider />
        <v-subheader>Certifications</v-subheader>

        <v-list>
          <Certification />
        </v-list>

        <v-divider />
      </template>

      <v-divider />

      <v-list two-line>
        <draggable v-model="analyses">
          <AnalysisTile
            v-for="analysis in analyses"
            :key="analysis.id"
            :analysis="analysis"
            :card-i-d="card.id"
          />
        </draggable>
      </v-list>
    </v-card>

    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('ui.areYouSure') }}
        </v-card-title>

        <v-card-text>
          <span
            v-if="!card.closed"
            v-text="$t('card.archiveDesc')"
          />
          <span
            v-else
            v-text="$t('card.unarchiveDesc')"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            :loading="deletingCard"
            @click.native="archivePlatform"
          >
            <span
              v-if="!card.closed"
              v-text="$t('card.archive')"
            />
            <span
              v-else
              v-text="$t('card.unarchive')"
            />
          </v-btn>
          <v-btn
            color="secondary"
            @click.native="deleteDialog = false"
          >
            {{ $t('ui.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="membersDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">
          <span>{{ $t('card.contributors') }}</span>
          <v-spacer />
          <v-btn
            icon
            @click="membersDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-list>
          <v-list-item
            v-for="member in card.members"
            :key="member.id"
            :href="'https://trello.com/' + member.username"
          >
            <v-list-item-avatar>
              <v-avatar
                size="36"
                color="grey lighten-1"
              >
                <img
                  v-if="member && member.avatarHash"
                  :title="member.fullName"
                  :src="member.avatarUrl + '/50.png'"
                  alt="avatar"
                >
                <span
                  v-else-if="member && member.initials"
                  class="subtitle-1 white--text"
                  :title="member.fullName"
                  v-text="member.initials"
                />
                <v-icon v-else>
                  mdi-account-question
                </v-icon>
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="member.fullName" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import moment from 'moment'
import AnalysisTile from '~/components/AnalysisTile'
import Certification from '~/components/certifications/Certification'
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
  name: 'Platform',
  transition: 'slide-x-transition',
  components: {
    AnalysisTile,
    Certification,
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

    try {
      await store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS')
    } catch (e) {
      await store.dispatch('snacks/error', 'errorGeneric')
    }

    store.dispatch('SET_VISITED_PLATFORM', params.cid)
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
        return this.$store.state.analyses.slice().sort((a, b) => {
          return a.order > b.order ? 1 : -1
        })
      },
      async set (list) {
        if (!this.canEdit) { return }

        try {
          await this.$store.dispatch('REORDER_ANALYSES', { cardID: this.card.id, list })
        } catch (e) {
          this.$store.dispatch('snacks/error', 'card.analysesReorderFailed')
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
        this.$store.dispatch('snacks/error', 'card.listUpdateFailed')
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

        this.$router.push({
          name: 'platforms-cid-analyses-aid-edit',
          params: {
            cid: this.card.id,
            aid: analysis.id
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', 'card.analysisCreationFailed')
      }

      this.creating = false
    },
    async archivePlatform () {
      this.deletingCard = true

      try {
        if (!this.card.closed) {
          await this.$store.dispatch('ARCHIVE_CARD', this.card.id)
        } else {
          await this.$store.dispatch('UNARCHIVE_CARD', this.card.id)
        }
        this.deleteDialog = false
        this.$router.push({ path: '/platforms' })
      } catch (e) {
        if (!this.card.closed) {
          this.$store.dispatch('snacks/error', 'card.archivalFailed')
        } else {
          this.$store.dispatch('snacks/error', 'card.unarchivalFailed')
        }
      }

      this.deletingCard = false
    },
    exportToEzlogger () {
      if (!this.analyses) { return }

      this.$store.dispatch('ezlogger/clearRequests')
      this.analyses.forEach(analysis => {
        if (analysis.url) {
          this.$store.dispatch('ezlogger/addRequestFromUrl', analysis.url)
        }
      })

      this.$router.push({ name: 'ezlogger' })
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
  },
  head () {
    return {
      title: `Platform: ${this.card.name}`
    }
  }
}
</script>
