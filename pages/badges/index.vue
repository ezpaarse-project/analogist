<template>
  <section>
    <v-card>
      <v-tabs v-model="activeTab" grow dark>
        <v-tab to="#tab-badges" class="vTitle">
          {{ $t('badges.title') }} <v-chip color="grey lighten-2"><strong>{{badgesOwned}}</strong> / {{badges.length}}</v-chip>
          <v-spacer></v-spacer>
        </v-tab>
        <v-tab to="#tab-issue" class="vTitle" v-if="user.role">
          {{ $t('badges.emitBadge') }}
          <v-spacer></v-spacer>
        </v-tab>
      </v-tabs>
      
      <v-card-text>
        <v-tabs-items v-model="activeTab">
          <v-tab-item id="tab-badges">
            <badges-view :badges="badges" :ping="ping" :user="user"></badges-view>
          </v-tab-item>

          <v-tab-item id="tab-issue">
            <badge-issue :user="user" :trelloBoardMembers="trelloBoardMembers"></badge-issue>
          </v-tab-item>
        </v-tabs-items>

        <a href="https://openbadgefactory.com/" target="blank">
          <img src="@/static/obf_logo.jpeg" alt="OpenBadgeFactory" :class="{ 'error': !ping }" class="obfactory" align="right">
        </a>
              
        <v-tooltip bottom v-if="user.role">
          <a slot="activator" href="https://blog.ezpaarse.org/2018/06/communication-les-badges-ezpaarse/" target="_blank">
            <v-icon>mdi-help-circle</v-icon>
          </a>
          <span>Informations</span>
        </v-tooltip>

      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import BadgesView from '~/components/badges/BadgesView'
import BadgeIssue from '~/components/badges/BadgeIssue'

export default {
  name: 'badges',
  transition: 'slide-x-transition',
  components: {
    BadgesView,
    BadgeIssue
  },
  head () {
    return {
      title: 'Badges'
    }
  },
  data () {
    return {
      activeTab: 'tab-badges'
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
    await store.dispatch('FETCH_TRELLO_BOARD_MEMBERS')
  },
  computed: {
    badges () {
      return this.$store.state.badges.badges
    },
    badgesOwned () {
      let badgesOwend = 0
      this.$store.state.badges.badges.forEach(badge => {
        if (badge.issued_on) badgesOwend += 1
      })
      return badgesOwend
    },
    ping () {
      return this.$store.state.badges.ping
    },
    user () {
      return this.$store.state.user
    },
    trelloBoardMembers () {
      return this.$store.state.trelloBoardMembers
    }
  },
  mounted () {
    this.$socket.on('BADGE_EMITTED', (data) => {
      if (data.emitted) this.$store.dispatch('snacks/success', 'badges.emitted')
    })
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
</style>
