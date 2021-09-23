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
              <img
                src="@/static/logo-analogist.png"
                alt="Analogist logo"
              >
            </p>
            <v-chip label>
              <span>
                <v-progress-circular
                  v-if="!metricsLoaded"
                  indeterminate
                  size="16"
                  width="2"
                  color="primary"
                />
                <strong v-else>{{ platforms }}</strong> {{ $t('home.identifiedPlatforms') }}
              </span>
            </v-chip>

            <v-chip label>
              <span>
                <v-progress-circular
                  v-if="!metricsLoaded"
                  indeterminate
                  size="16"
                  width="2"
                  color="primary"
                />
                <strong v-else>{{ parsers }}</strong> {{ $t('home.parsers') }}
              </span>
            </v-chip>

            <v-chip
              v-if="badgesEnabled"
              label
            >
              <span>
                <v-progress-circular
                  v-if="!metricsLoaded"
                  indeterminate
                  size="16"
                  width="2"
                  color="primary"
                />
                <strong v-else>{{ badges }}</strong> {{ $t('home.badges') }}
              </span>
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
  async asyncData ({ env }) {
    return {
      badges: -1,
      platforms: -1,
      parsers: -1,
      metricsLoaded: false,
      badgesEnabled: env.badgesEnabled
    }
  },
  mounted () {
    this.metrics()
  },
  methods: {
    async metrics () {
      if (this.badgesEnabled) {
        try {
          const { data: count } = await this.$axios.get('/api/badges/metrics/count', { timeout: 2000 })
          this.badges = count
        } catch (e) { this.badges = 0 }
      }

      try {
        const { data: count } = await this.$axios.get('/api/trello/cards/count', { timeout: 2000 })
        this.platforms = count
      } catch (err) { this.platforms = 0 }

      try {
        const { data: count } = await this.$axios.get('api/platforms/count', { timeout: 2000 })
        this.parsers = count
      } catch (error) { this.parsers = 0 }

      this.metricsLoaded = true
    }
  },
  head () {
    return {
      title: 'Analogist'
    }
  }
}
</script>
