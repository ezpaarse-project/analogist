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
        <template slot="items" slot-scope="{ item }">
          <tr @click="currentBadge = item.badge; getUsers()">
            <td>
              <img :src="item.badge.img" class="badgeImage">
              <span v-if="$i18n.locale === 'fr'">{{ item.badge.name }}</span>
              <span v-else>{{ item.badge.alt_language[$i18n.locale].name }}</span>
            </td>
            <td class="text-xs-left">{{ item.issues.app }}</td>
          </tr>
        </template>
        <v-alert slot="no-results" :value="true" color="info" icon="mdi-alert-circle">
          {{ $t('badges.searchNotFound', {search}) }}
        </v-alert>
      </v-data-table>

      <v-list v-if="currentBadge && users && members" class="mt-1">
        <v-layout row wrap>
          <template v-for="user in users">
            <v-flex xs2 sm2 :key="getUserInfos(user).idMember">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img :src="`${getUserInfos(user).member.avatarUrl}/50.png`">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title v-html="getUserInfos(user).member.fullName"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="getUserInfos(user).member.fullName"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-flex>
          </template>
        </v-layout>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['metrics'],
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
    getUsers () {
      this.$store.dispatch('badges/getUsers', this.currentBadge.id)
    },
    getUserInfos (user) {
      return this.$store.state.badges.members.find(member => {
        return member.idMember === user
      })
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
