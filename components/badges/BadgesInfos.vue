<template>
  <v-layout row wrap>
    <v-flex xs12 sm12>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        :label="$t('ui.search')"
        single-line
      ></v-text-field>
    </v-flex>
    <v-flex xs12 sm12>
      <v-data-table
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
              <img :src="props.item.badge.img" class="badgeImage">
              <span v-if="$i18n.locale === 'fr'">{{ props.item.badge.name }}</span>
              <span v-else>{{ props.item.badge.alt_language[$i18n.locale].name }}</span>
            </td>
            <td class="text-xs-left">{{ props.item.issues.app }}</td>
          </tr>
          <v-card flat v-if="currentBadge && users && members && currentBadge.id == props.item.badge.id && getUserInfos(users[0])">
            <v-card-text>
              <v-list class="mt-1" justify-center>
                <v-layout row wrap justify-left>
                  <template v-for="user in users">
                    <v-flex :key="getUserInfos(user).idMember">
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
                    </v-flex>
                  </template>
                </v-layout>
              </v-list>
            </v-card-text>
          </v-card>
        </template>
        <v-alert slot="no-results" :value="true" color="info" icon="mdi-alert-circle">
          {{ $t('badges.searchNotFound', {search}) }}
        </v-alert>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'

export default {
  props: ['metrics', 'user'],
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
  computed: {
    users () {
      return this.$store.state.badges.users
    },
    members () {
      return this.$store.state.badges.members
    }
  },
  methods: {
    getUsers (badge) {
      if (!this.user.isAuthorized) return
      
      this.currentBadge = badge

      if (!this.users || !this.members) {
        this.$store.dispatch('badges/getUsers', badge.id)
      }
    },
    getUserInfos (user) {
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
.badgeImage {
  width: 32px;
  vertical-align: middle;
  margin-right: 5px;
}
</style>
