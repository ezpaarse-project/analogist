<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('cards.home') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-md class="headline">
          <div class="text-xs-center">
            <p>
              <img src="~/assets/img/logo-analogist.png">
            </p>
            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="infos.platforms || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.identifiedPlatforms') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="infos.analyses || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.analyses') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="parsers || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.parsers') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="trelloBoardMembers || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.contributors') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar left color="primary white--text">
                <span v-text="badges || '—'"></span>
              </v-avatar>
              <span>{{ $t('home.badges') }}</span>
            </v-chip>
          </div>

          <p><span class="font-weight-bold">AnalogIST</span> est l'espace collaboratif où sont réunies toutes les analyses de plateformes (pré-requises pour la création de parseurs pour ezPAARSE). </p>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  name: 'analogist',
  transition: 'slide-x-transition',
  head () {
    return {
      title: 'Analogist'
    }
  },
  async asyncData () {
    const { data } = await axios.get('http://ezpaarse-preprod.couperin.org/info/platforms')
    if (!Array.isArray(data)) { throw new Error('invalid response') }
    return {
      parsers: data.length
    }
  },
  async fetch ({ store }) {
    await store.dispatch('FETCH_CARDS')
    await store.dispatch('FETCH_TRELLO_BOARD_MEMBERS')
    await store.dispatch('badges/getMetrics')
  },
  computed: {
    infos () {
      return {
        platforms: this.$store.state.cards.length,
        analyses: this.$store.state.cards.reduce((a, b) => (a + (b.platform ? b.platform.analyses.length : 0)), 0)
      }
    },
    trelloBoardMembers () {
      return this.$store.state.trelloBoardMembers.length
    },
    badges () {
      return this.$store.state.badges.metrics.reduce((a, b) => (a + b.issues.app), 0)
    }
  }
}
</script>
