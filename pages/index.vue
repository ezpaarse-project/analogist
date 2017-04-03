<template>
  <section>
    <v-card>
      <v-toolbar class="cyan">
        <v-toolbar-title>Plateformes</v-toolbar-title>
      </v-toolbar>

      <v-card-row>
        <v-card-column class="pa-3">
          <v-text-field
              name="input-10-1"
              label="Recherche"
              v-model="search"
              prepend-icon="search"
            ></v-text-field>
        </v-card-column>

        <!--<v-card-column class="pa-3">
          <v-select
            v-bind:items="sortChoices"
            v-model="sortBy"
            item-text="desc"
            label="Trier par"
          />
        </v-card-column>-->
      </v-card-row>

      <!--<v-list two-line>
        <v-list-item v-for="(platform, index) in platforms" :key="platform.id">
          <v-list-tile router :href="{ name: 'id', params: { id: platform.id }}">
            <v-list-tile-content>
              <v-list-tile-title v-text="platform.name" />
              <v-list-tile-sub-title>
                {{ platform.dateLastActivity }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-item>
      </v-list>-->

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Dernière activité</th>
            <th>URLs analysées</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(card, index) in cards" :key="card.id">
            <td>
              <router-link :to="{ name: 'platform-cid', params: { cid: card.id }}" v-text="card.name"/>
            </td>
            <td v-text="card.dateLastActivity" />

            <td v-if="card.platform && card.platform.analyses">{{ card.platform.analyses.length }}</td>
            <td v-else>0</td>
          </tr>
        </tbody>
      </table>
    </v-card>
  </section>
</template>

<script>
export default {
  name: 'platforms',
  data () {
    return {
      search: '',
      sortBy: 'nameAsc',
      sortChoices: [
        { key: 'nameAsc', desc: 'A -> Z' },
        { key: 'nameDesc', desc: 'Z -> A' }
      ]
    }
  },
  head () {
    return {
      title: 'Platforms'
    }
  },
  async fetch ({ store }) {
    await store.dispatch('FETCH_TRELLO_LISTS')
    await store.dispatch('FETCH_CARDS')
  },
  computed: {
    cards () {
      const search = this.search.toLowerCase()
      return this.$store.state.lists.cards.filter(p => {
        return p.name.toLowerCase().includes(search)
      }).sort((a, b) => {
        switch (this.sortBy) {
          case 'nameDesc':
            return a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1
          default:
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
