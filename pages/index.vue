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

      <v-list three-line>
        <CardTile v-for="card in cards" :key="card.id" :card="card"></CardTile>
      </v-list>
    </v-card>
  </section>
</template>

<script>
import CardTile from '~components/CardTile'

export default {
  name: 'platforms',
  components: {
    CardTile
  },
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
