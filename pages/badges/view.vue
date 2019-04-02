<template>
  <section>
    <v-card>
      <v-toolbar class="secondary" dense dark card>
        <v-toolbar-title>
          {{ $t('badges.title') }} <v-chip color="grey lighten-2"><strong>{{badgesOwned}}</strong> / {{badges.badges.length}}</v-chip>
        </v-toolbar-title>
      </v-toolbar>
      
      <v-card-text>
        <v-layout row wrap justify-center>
          <v-flex xs12 sm12>
            <v-switch
              style="float: right"
              :label="visibility ? $t('badges.public') : $t('badges.private')"
              v-model="visibility"
            ></v-switch>
          </v-flex>
        </v-layout>

        <v-layout v-if="badges && badges.badges && ping" row wrap justify-center>
          <v-flex xs12 sm2 v-for="badge in badges.badges" :key="badge.id" @click="currentBadge = badge; linkedInModal = false" :class="{ 'notPossessed' : !badge.issued_on }">
            <img class="mx-auto badgeImage" :src="badge.image">
            <h4 class="badgeName" v-if="$i18n.locale === 'fr'">{{ badge.name }}</h4>
            <h4 class="badgeName" v-else>{{ badge.alt_language[$i18n.locale].name }}</h4>
          </v-flex>

          <v-flex xs12 sm12 v-if="!ping">
            <v-card class="red white--text">
              <v-card-text>
                {{ $t('badges.error') }}
              </v-card-text>
            </v-card>
          </v-flex>

          <v-dialog v-if="currentBadge && !linkedInModal" v-model="currentBadge" max-width="600px">
            <badge-card :badge="currentBadge" :userId="user.id" @closeCard="closeCard" @linkedIn="linkedIn"></badge-card>
          </v-dialog>
        
          <v-dialog v-if="linkedInModal && currentBadge" v-model="currentBadge" max-width="600px">
            <linked-in-card :badge="currentBadge" :userId="user.id" @closeLinkedInCard="closeLinkedInCard"></linked-in-card>
          </v-dialog>
        </v-layout>

        <a href="https://openbadgefactory.com/" target="blank">
          <img src="@/static/obf_logo.jpeg" alt="OpenBadgeFactory" :class="{ 'error': !ping }" class="obfactory" align="right">
        </a>
              
        <v-tooltip bottom>
          <v-btn flat :icon="true" slot="activator" href="https://blog.ezpaarse.org/2018/06/communication-les-badges-ezpaarse/" target="_blank">
            <v-icon>mdi-help-circle</v-icon>
          </v-btn>
          <span>Informations</span>
        </v-tooltip>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import BadgeCard from '~/components/badges/BadgeCard'
import LinkedInCard from '~/components/badges/LinkedInCard'

export default {
  name: 'badges',
  transition: 'slide-x-transition',
  components: {
    BadgeCard,
    LinkedInCard
  },
  head () {
    return {
      title: 'Badges'
    }
  },
  data () {
    return {
      modal: false,
      currentBadge: null,
      linkedInModal: false,
      visible: false
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
  watch: {
    user: function () {
      if (!this.user) return this.$router.push('/badges/list')
    }
  },
  computed: {
    badges () {
      return this.$store.state.badges
    },
    badgesOwned () {
      let badgesOwend = 0
      if (this.$store.state.badges.badges) {
        this.$store.state.badges.badges.forEach(badge => {
          if (badge.issued_on) badgesOwend += 1
        })
      }
      return badgesOwend
    },
    visibility: {
      get () { return this.$store.state.badges.visibility },
      set (newVal) { this.$store.dispatch('badges/setVisiblity', newVal) }
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
      this.linkedInModal = false
    },
    linkedIn () {
      this.linkedInModal = true
    },
    closeLinkedInCard () {
      this.linkedInModal = false
      this.currentBadge = null
    }
  }
}
</script>

<style scoped>
.vTitle {
  text-transform: none;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: .02em;
}
img.obfactory {
  width: 220px;
}
img.error {
  filter: grayscale(100%);
  opacity: 0.6;
}
.badgeImage {
  display: block; 
  margin: auto;
  cursor: pointer;
}
.badgeName {
  text-align: center;
  cursor: pointer;
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
