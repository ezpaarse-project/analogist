<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('badges.title') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container fluid grid-list-md>
          <v-layout row wrap justify-center>
            <v-flex xs12 sm12>
              <v-card class="blue white--text">
                <v-card-text>
                  {{ $t('badges.issues', { issues: metrics.issues }) }}
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex xs12 sm2 v-if="badges" v-for="badge in badges" :key="badge.id" @click.stop="currentBadge = badge">
              <img class="mx-auto badgeImage" :src="badge.image" width="60%">
              <h4 class="badgeName">{{ badge.name }}</h4>
            </v-flex>

            <v-dialog v-if="currentBadge" v-model="currentBadge" max-width="600px">
              <v-card>
                <v-container fluid grid-list-lg>
                  <v-layout row>
                    <v-flex xs5>
                      <v-card-media :src="currentBadge.image" height="100%" contain></v-card-media>
                    </v-flex>
                    <v-flex xs7>
                      <div>
                        <p class="headline">{{ currentBadge.name }}</p>
                        
                        <p>{{ currentBadge.description }}</p>
                        <p>{{ $t('badges.issuedOn') }} : {{ currentBadge.issued_on }}</p>
                      </div>
                    </v-flex>
                  </v-layout>
                </v-container>
                <v-card-actions>
                  <v-btn color="red" flat @click.stop="currentBadge = null">{{ $t('ezLogger.close') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import CardTile from '~/components/CardTile'

export default {
  name: 'badges',
  transition: 'slide-x-transition',
  components: {
    CardTile
  },
  head () {
    return {
      title: 'Badges'
    }
  },
  data () {
    return {
      modal: false,
      currentBadge: null
    }
  },
  async fetch ({ store, redirect, app }) {
    try {
      await store.dispatch('FETCH_PROFILE')
    } catch (e) {
      return redirect('/')
    }

    await store.dispatch('badges/getMetrics')
    await store.dispatch('badges/getBadges', { email: store.state.user.email, locale: app.i18n.locale })
  },
  computed: {
    badges () {
      return this.$store.state.badges.badges
    },
    metrics () {
      return this.$store.state.badges.metrics
    },
    user () {
      return this.$store.state.user
    }
  }
}
</script>

<style scoped>
.badgeImage {
  display: block; 
  margin: auto;
  cursor: pointer;
}
.badgeName {
  text-align: center;
  cursor: pointer;
}
</style>
