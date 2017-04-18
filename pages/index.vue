<template>
  <section>
    <v-text-field v-model="search" prepend-icon="search" label="Recherche..." hide-details single-line />

    <v-card>
      <v-card-row class="cyan white--text">
        <v-card-title>
          Plateformes
        </v-card-title>
        <v-spacer/>
        <div>
          <v-btn v-if="canEdit" floating icon router :href="{ name: 'platforms-new' }">
            <v-icon>add</v-icon>
          </v-btn>
        </div>
      </v-card-row>

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
              <router-link :to="{ name: 'platforms-cid', params: { cid: card.id }}" v-text="card.name"/>
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
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    },
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
