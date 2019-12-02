<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          Badges
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12 sm12 v-if="metrics">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              :label="$t('ui.search')"
              single-line
            ></v-text-field>
          </v-flex>

          <v-flex xs12 sm12 mb-3>
            <v-data-table
              v-if="metrics"
              :headers="headers"
              :items="metrics"
              item-key="badge.id"
              hide-actions
              sort-icon="mdi-menu-down"
              :search="search"
              :pagination.sync="pagination"
              class="elevation-1"
            >
              <template slot="items" slot-scope="props">
                <tr @click="getUsers(props.item.badge)">
                  <td>
                    <img :src="props.item.badge.image" class="badgeImage">
                    <span v-if="$i18n.locale === 'fr'">{{ props.item.badge.name }}</span>
                    <span v-else>{{ props.item.badge.alt_language[$i18n.locale].name }}</span>
                  </td>
                  <td class="text-xs-left">{{ props.item.issues.app }}</td>
                </tr>
                <tr>
                  <td colspan="2" v-if="currentBadge && users && members && currentBadge.id == props.item.badge.id && getUserInfos(users[0])">
                    <v-layout row wrap justify-center>
                      <template v-for="user in users">
                        <div :key="getUserInfos(user).idMember" class="pt-2 pb-2">
                          <v-list-tile avatar>
                            <v-list-tile-avatar>
                              <img v-if="getUserInfos(user).member.avatarHash" :src="`${getUserInfos(user).member.avatarUrl}/50.png`">
                              <span v-else>
                                <v-avatar color="blue-grey lighten-4">
                                  <span class="white--text headline"><small>{{getUserInfos(user).member.initials}}</small></span>
                                </v-avatar>
                              </span>
                            </v-list-tile-avatar>

                            <v-list-tile-content>
                              <v-list-tile-title v-html="getUserInfos(user).member.fullName"></v-list-tile-title>
                              <v-list-tile-sub-title v-html="getUserInfos(user).issuedOn"></v-list-tile-sub-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </div>
                      </template>
                    </v-layout>
                  </td>
                </tr>
              </template>
              <v-alert slot="no-results" :value="true" color="info" icon="mdi-alert-circle">
                {{ $t('badges.searchNotFound', {search}) }}
              </v-alert>
            </v-data-table>

            <v-card class="red white--text" v-else>
              <v-card-text>
                {{ $t('badges.noMetrics') }}
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>

        <a href="https://openbadgefactory.com/" target="blank">
          <img src="@/static/obf_logo.png" alt="OpenBadgeFactory" :class="{ 'error': !ping }" class="obfactory" align="right">
        </a>
              
        <v-tooltip bottom>
          <v-btn flat :icon="true" slot="activator" href="https://blog.ezpaarse.org/2018/06/communication-les-badges-ezpaarse/" target="_blank">
            <v-icon>mdi-help-circle</v-icon>
          </v-btn>
          <span>Informations</span>
        </v-tooltip>

      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import moment from 'moment'

export default {
  data () {
    return {
      search: '',
      currentBadge: null,
      pagination: {
        sortBy: 'issues.obf',
        descending: true,
        rowsPerPage: -1
      },
      headers: [
        {
          text: 'Badges',
          align: 'left',
          sortable: false,
          value: 'badge.name'
        },
        {
          text: 'AnalogIST',
          align: 'left',
          value: 'issues.app'
        }
      ]
    }
  },
  async fetch ({ store, redirect, app }) {
    await store.dispatch('badges/getPing')
    await store.dispatch('badges/getMetrics')
  },
  computed: {
    metrics () {
      return this.$store.state.badges.metrics
    },
    ping () {
      return this.$store.state.badges.ping
    },
    user () {
      return this.$store.state.user
    },
    trelloBoardMembers () {
      return this.$store.state.trelloBoardMembers
    },
    users () {
      return this.$store.state.badges.users
    },
    members () {
      return this.$store.state.badges.members
    }
  },
  methods: {
    getUsers (badge) {
      if (!this.user || !this.user.isAuthorized) return

      this.currentBadge = badge
      this.$store.dispatch('badges/getUsers', badge.id)
    },
    getUserInfos (user) {
      if (!user) return

      const member = this.$store.state.badges.members.find(member => {
        return member.idMember === user.userId
      })
      if (member) member.issuedOn = moment.unix(user.issuedOn).locale(this.$i18n.locale).format('LL')
      return member
    }
  }
}
</script>

<style scoped>
img.obfactory {
  width: 220px;
}
img.error {
  filter: grayscale(100%);
  opacity: 0.6;
}
.badgeImage {
  width: 32px;
  vertical-align: middle;
  margin-right: 5px;
}
</style>
