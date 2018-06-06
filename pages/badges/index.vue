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
            <v-flex xs12 sm2 v-if="badges && ping" v-for="badge in badges" :key="badge.id" @click.stop="currentBadge = badge" :class="{ 'notPossessed' : !badge.issued_on }">
              <img class="mx-auto badgeImage" :src="badge.image" width="60%">
              <h4 class="badgeName">{{ badge.name }}</h4>
            </v-flex>

            <v-flex xs12 sm12 v-if="!ping">
              <v-card class="red white--text">
                <v-card-text>
                  {{ $t('badges.error') }}
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex xs12 sm12>
              <v-card>
                <a href="https://openbadgefactory.com/" target="blank">
                  <img src="@/static/obf_logo.jpeg" alt="OpenBadgeFactory" :class="{ 'error': !ping }" class="obfactory" align="right">
                </a>
              </v-card>
            </v-flex>

            <v-dialog v-if="currentBadge" v-model="currentBadge" max-width="600px">
              <badge-card :badge="currentBadge" @closeCard="closeCard"></badge-card>
            </v-dialog>
            
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import BadgeCard from '~/components/BadgeCard'

export default {
  name: 'badges',
  transition: 'slide-x-transition',
  components: {
    BadgeCard
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

    await store.dispatch('badges/getPing')
    await store.dispatch('badges/getBadges', { id: store.state.user.id, locale: app.i18n.locale })
  },
  computed: {
    badges () {
      return this.$store.state.badges.badges
    },
    ping () {
      return this.$store.state.badges.ping
    },
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    closeCard () {
      this.currentBadge = null
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
img.obfactory {
  width: 220px;
}
img.error {
  filter: grayscale(100%);
  opacity: 0.6;
}
.notPossessed {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.5s ease-in-out;
}
.notPossessed:hover {
  filter: grayscale(0%);
  opacity: 1;
}
</style>
