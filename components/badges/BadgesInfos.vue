<template>
  <v-container fluid grid-list-md>
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
            <td>
              <img :src="item.badge.img" class="badgeImage">
              <span v-if="$i18n.locale === 'fr'">{{ item.badge.name }}</span>
              <span v-else>{{ item.badge.alt_language[$i18n.locale].name }}</span>
            </td>
            <td class="text-xs-left">{{ item.issues.app }}</td>
          </template>
          <v-alert slot="no-results" :value="true" color="info" icon="mdi-alert-circle">
            {{ $t('badges.searchNotFound', {search}) }}
          </v-alert>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['metrics'],
  data () {
    return {
      search: '',
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
