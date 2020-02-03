<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark flat>
        <v-toolbar-title>{{ $t('cards.platforms') }} ({{ cards.length }})</v-toolbar-title>

        <v-btn absolute fab bottom right color="primary" v-if="canEdit" :to="{ name: 'platforms-new' }">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-md>
          <v-layout row wrap>
            <v-flex xs12 sm5>
              <v-text-field
                @input="checkPage"
                :label="$t('cards.search')"
                v-model="searchText"
                append-icon="mdi-magnify"
                hide-details
                single-line
                clearable
              />
            </v-flex>
            <v-flex xs12 sm5>
              <v-select
                @input="checkPage"
                :label="$t('cards.status')"
                :items="lists"
                v-model="searchLists"
                item-text="name"
                item-value="id"
                append-icon="mdi-tag"
                hide-details
                single-line
                multiple
                clearable
              >
                <template slot="selection" slot-scope="{ item, index }">
                  <span v-if="index === 0">{{ item.name }}</span>
                  <span
                    v-if="index === 1"
                    class="grey--text caption"
                  >&nbsp;(+{{ searchLists.length - 1 }} {{ $t('others') }})</span>
                </template>
              </v-select>
            </v-flex>
            <v-flex xs12 sm2>
              <v-select
                @input="checkPage"
                :label="$t('cards.certifications')"
                :items="certifications"
                v-model="searchCertifications"
                item-text="name"
                item-value="id"
                append-icon="mdi-certificate"
                hide-details
                single-line
                multiple
                clearable
              >
              <template v-slot:item="{ item }">
                {{ item.name }}
                <v-list-item-avatar style="margin-left: 10px" size="24" v-if="item.id === 'humanCertified'" color="#F4B48B">
                  <span class="white--text">H</span>
                </v-list-item-avatar>
                <v-list-item-avatar style="margin-left: 10px" size="24" v-if="item.id === 'publisherCertified'" color="#5AB9C1">
                  <span class="white--text">P</span>
                </v-list-item-avatar>
              </template>
              </v-select>
            </v-flex>

            <v-flex xs12 sm12>
              <v-checkbox
                v-model="displayAllCards"
                :label="$t('cards.displayAllPlatforms')"
                color="primary"
                hide-details
              ></v-checkbox>
            </v-flex>
          </v-layout>
        </v-container>

        <div class="text-center pt-3">
          <v-pagination
            prev-icon="mdi-chevron-left"
            next-icon="mdi-chevron-right"
            :length="nbPages"
            v-model="searchPage"
            :total-visible="5"
          />
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
  data () {
    return {
      displayAll: false
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
        this.$store.dispatch('UPDATE_SEARCH_TEXT', newValue || '')
      }
    },
    searchLists: {
      get () {
        return this.$store.state.searchLists
      },
      set (newValue) {
        this.$store.dispatch('UPDATE_SEARCH_LISTS', newValue || [])
      }
    },
    displayAllCards: {
      get () {
        return this.$store.state.displayAllCards
      },
      set (newValue) {
        this.$store.dispatch('DISPLAY_ALL_CARDS', newValue || false)
      }
    },
    searchCertifications: {
      get () {
        return this.$store.state.searchCertifications
      },
      set (newValue) {
        this.$store.dispatch('UPDATE_SEARCH_CERTIFICATIONS', newValue || [])
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
    certifications () {
      return [
        {
          id: 'humanCertified',
          name: this.$t('certifications.human')
        },
        {
          id: 'publisherCertified',
          name: this.$t('certifications.publisher')
        }
      ]
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    },
    cards () {
      const search = this.searchText.toLowerCase()
      const lists = this.searchLists
      const certifications = this.searchCertifications

      return this.$store.state.cards
        .filter(card => {
          if (!card.name.toLowerCase().includes(search)) {
            return false
          }

          if (lists.length && lists.indexOf(card.idList) === -1) {
            return false
          }

          if (certifications.length) {
            return certifications.some(certification => {
              if (card.platform) {
                const humanCertifications = card.platform.humanCertifications[0]
                const publisherCertifications = card.platform.publisherCertifications[0]
                return (humanCertifications && humanCertifications.certifications[certification] && humanCertifications.status === 'accepted') ||
                       (publisherCertifications && publisherCertifications.certifications[certification] && publisherCertifications.status === 'accepted')
              }
            })
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
