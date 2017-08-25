<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dark card>
        <v-toolbar-title>
          {{ $t('cards.platforms') }} ({{ cards.length }})
        </v-toolbar-title>

        <v-btn absolute fab bottom right class="pink" v-if="canEdit" :to="{ name: 'platforms-new' }">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-layout row-sm column>
          <v-flex xs12 sm6>
            <v-text-field @input="checkPage" hide-details single-line :label="$t('cards.search')" v-model="searchText" append-icon="search" />
          </v-flex>
          <v-flex xs12 sm6>
            <v-select @input="checkPage" hide-details single-line :label="$t('cards.status')" append-icon="label" :items="lists" v-model="searchLists" item-text="name" item-value="id" multiple />
          </v-flex>
        </v-layout>

        <div class="text-xs-center">
          <v-pagination :length="nbPages" v-model="searchPage" total-visible="3"></v-pagination>
        </div>
      </v-card-text>

      <v-list three-line>
        <CardTile v-for="card in paginatedCards" :key="card.id" :card="card"></CardTile>
      </v-list>
    </v-card>
  </section>
</template>

<script>
import CardTile from '~/components/CardTile'

export default {
  name: 'platforms',
  transition: 'slide-x-transition',
  components: {
    CardTile
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
  methods: {
    checkPage () {
      if (this.searchPage <= 0 || this.searchPage > this.nbPages) {
        this.$store.dispatch('SET_SEARCH_PAGE', 1)
      }
    }
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
    searchPage: {
      get () {
        return this.$store.state.searchPage
      },
      set (newValue) {
        this.$store.dispatch('SET_SEARCH_PAGE', newValue)
      }
    },
    nbPages () {
      return Math.ceil(this.cards.length / 20) || 1
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

      return this.$store.state.cards
        .filter(card => {
          if (!card.name.toLowerCase().includes(search)) {
            return false
          }

          if (lists.length && lists.indexOf(card.idList) === -1) {
            return false
          }

          return true
        })
        .sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)
    },
    paginatedCards () {
      return this.cards.slice((this.searchPage - 1) * 20, (this.searchPage - 1) * 20 + 20)
    }
  }
}
</script>

<style scoped>
</style>
