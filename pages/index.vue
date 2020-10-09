<template>
  <section>
    <v-card>
      <v-toolbar
        class="secondary"
        dense
        dark
        flat
      >
        <v-toolbar-title>{{ $t('cards.home') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container
          fluid
          grid-list-md
          style="font-size: 1.2em;"
        >
          <div class="text-center">
            <p>
              <img src="@/static/logo-analogist.png">
            </p>
            <v-chip pill>
              <v-avatar
                left
                color="primary white--text"
              >
                <span v-text="infos.platforms || '—'" />
              </v-avatar>
              <span>{{ $t('home.identifiedPlatforms') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar
                left
                color="primary white--text"
              >
                <span v-text="infos.analyses || '—'" />
              </v-avatar>
              <span>{{ $t('home.analyses') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar
                left
                color="primary white--text"
              >
                <span v-text="trelloBoardMembers || '—'" />
              </v-avatar>
              <span>{{ $t('home.contributors') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar
                left
                color="primary white--text"
              >
                <span v-text="badges || '—'" />
              </v-avatar>
              <span>{{ $t('home.badges') }}</span>
            </v-chip>
          </div>

          <v-layout
            row
            wrap
            mt-4
          >
            <v-flex
              xs12
              sm12
            >
              <p
                class="text-xs-justify"
                v-html="$t('home.whatIsEzPaarse')"
              />
              <p
                class="text-xs-justify"
                v-html="$t('home.whatIsAnalogist')"
              />
              <p
                class="text-xs-justify"
                v-html="$t('home.goodAnalyses')"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
export default {
  name: 'Analogist',
  transition: 'slide-x-transition',
  async fetch ({ store }) {
    await store.dispatch('FETCH_CARDS')
    await store.dispatch('FETCH_TRELLO_BOARD_MEMBERS')
    await store.dispatch('badges/getMetrics')
  },
  computed: {
    infos () {
      return {
        platforms: this.$store.state.cards.length,
        analyses: this.$store.state.cards.reduce((a, b) => (a + ((b.platform && b.platform.analyses) ? b.platform.analyses.length : 0)), 0)
      }
    },
    trelloBoardMembers () {
      return this.$store.state.trelloBoardMembers.length
    },
    badges () {
      return this.$store.state.badges.metrics ? this.$store.state.badges.metrics.reduce((a, b) => (a + b.issues.app), 0) : 0
    }
  },
  head () {
    return {
      title: 'Analogist'
    }
  }
}
</script>
