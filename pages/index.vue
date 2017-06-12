<template>
  <section>

    <v-expansion-panel class="my-2">
      <v-expansion-panel-content>
        <div slot="header">{{ $t('cards.search') }}</div>
        <v-card>
          <v-card-text>
            <v-text-field :label="$t('cards.name')" v-model="searchText" prepend-icon="search" />
            <v-select :label="$t('cards.status')" prepend-icon="label" :items="lists" v-model="searchLists" item-text="name" item-value="id" multiple chips />
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-card>
      <v-card-row class="cyan white--text">
        <v-card-title>
          {{ $t('cards.platforms') }} ({{ cards.length }})
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
    searchText: {
      get () {
        return this.$store.state.searchText
      },
      set (newValue) {
        this.$store.dispatch('UPDATE_SEARCH_TEXT', newValue)
      }
    },
    searchLists: {
      get () {
        return this.$store.state.searchLists
      },
      set (newValue) {
        this.$store.dispatch('UPDATE_SEARCH_LISTS', newValue)
      }
    },
    lists () {
      return this.$store.state.trelloLists
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    },
    cards () {
      const search = this.searchText.toLowerCase()
      const lists = this.searchLists

      return this.$store.state.cards.filter(card => {
        if (!card.name.toLowerCase().includes(search)) {
          return false
        }

        if (lists.length && !lists.find(l => l.id === card.idList)) {
          return false
        }

        return true
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
