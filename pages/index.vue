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
                <span v-text="platforms" />
              </v-avatar>
              <span>{{ $t('home.identifiedPlatforms') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar
                left
                color="primary white--text"
              >
                <span v-text="parsers" />
              </v-avatar>
              <span>{{ $t('home.parsers') }}</span>
            </v-chip>

            <v-chip pill>
              <v-avatar
                left
                color="primary white--text"
              >
                <span v-text="badges" />
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
                v-html="$t('home.whatIsEzPaarse', { parsers })"
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
  async asyncData ({ $axios }) {
    let badges
    let platforms
    let parsers

    try {
      const { data: count } = await $axios.get('/api/badges/metrics/count')
      badges = count
    } catch (e) { badges = 0 }

    try {
      const { data: count } = await $axios.get('/api/trello/cards/count')
      platforms = count
    } catch (err) { platforms = 0 }

    try {
      const { data: count } = await $axios.get('http://dev.ezpaarse.org/api/info/platforms/count')
      parsers = count
    } catch (error) { parsers = 0 }

    return {
      badges,
      platforms,
      parsers
    }
  },
  head () {
    return {
      title: 'Analogist'
    }
  }
}
</script>
