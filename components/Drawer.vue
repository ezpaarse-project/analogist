<template>
  <v-navigation-drawer v-model="drawer" app clipped fixed disable-route-watcher width="300">
    <v-list class="text-center">
      <v-btn class="black--text ml-2 mr-2" icon target="_blank" v-for="link in links" :title="link.title" :href="link.href" :key="link.icon">
        <v-icon>{{ link.icon }}</v-icon>
      </v-btn>
    </v-list>

    <v-divider></v-divider>

    <v-list>
      <v-list-item link router :href="loginUrl" v-if="!user">
        <v-list-item-avatar>
          <v-icon large>mdi-account-circle</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="$t('drawer.login')"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-else>
        <v-list-item-avatar>
          <img v-if="user && user.avatarHash" :title="user.fullName" :src="'https://trello-avatars.s3.amazonaws.com/' + user.avatarHash + '/50.png'" alt="avatar" />
          <span v-else-if="user" class="subtitle-1 white--text" :title="user.fullName" v-text="user.initials" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="user.fullName"></v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" text icon @click="logout">
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('drawer.logout') }}</span>
          </v-tooltip>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list pt-0>
      <v-list-item link router :to="{ path: '/' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="$t('drawer.home')"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item router :to="{ path: '/platforms' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-file-powerpoint-box</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="$t('drawer.platforms')"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item :href="trelloLink" target="_blank">
        <v-list-item-icon>
          <v-icon>mdi-trello</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="$t('drawer.trelloBoard')"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item router :to="{ path: '/ezlogger' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-file-find</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="$t('drawer.ezLogger')"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-group no-action append-icon="mdi-chevron-down" :value="$nuxt.$route.name.indexOf('badges') !== -1">
        <template v-slot:activator>
          <v-list-item-icon>
            <logo-open-badge></logo-open-badge>
          </v-list-item-icon>
          <v-list-item-title class="subtitle-2 font-weight-regular">OpenBadges</v-list-item-title>
        </template>

        <v-list-item v-if="user" router :to="{ path: '/badges/view' }" ripple>
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ $t('drawer.badges') }}</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-wallet-membership</v-icon>
          </v-list-item-icon>
        </v-list-item>

        <v-list-item v-if="user && user.role === 'admin'" router :to="{ path: '/badges/emit' }" ripple>
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ $t('badges.emitBadge') }}</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-send</v-icon>
          </v-list-item-icon>
        </v-list-item>

        <v-list-item router :to="{ path: '/badges/list' }" ripple>
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ $t('badges.list') }}</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted-square</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>

      <v-list-group no-action append-icon="mdi-chevron-down" prepend-icon="mdi-translate">
        <template v-slot:activator>
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ $t('drawer.language') }}</v-list-item-title>
        </template>

        <v-list-item v-for="lang in locales" :key="lang.value" @click="$i18n.locale = lang.value">
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ lang.name }}</v-list-item-title>
          <v-list-item-icon>
            <img width="24" :src="require(`@/static/${lang.value}.png`)" />
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>
    </v-list>

    <v-list text class="text-center bottomList">
      <v-layout row wrap align-center justify-center mb-2>
        <v-flex xs12 mb-5>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn small text icon v-on="on" @click="dark = !dark">
                <v-icon v-if="dark">mdi-white-balance-sunny</v-icon>
                <v-icon v-else>mdi-weather-night</v-icon>
              </v-btn>
            </template>
            <span v-if="dark">{{ $t('theme.light') }}</span>
            <span v-else>{{ $t('theme.dark') }}</span>
          </v-tooltip>
        </v-flex>
        <v-flex xs12>
          <v-btn
            small
            class="ma-0"
            href="https://github.com/ezpaarse-project/analogist#readme"
            target="_blank"
            outlined
          >
            Version: {{ appVersion }}
            <v-icon right>
              mdi-github-circle
            </v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import LogoOpenBadge from '~/components/badges/LogoOpenBadge'

export default {
  components: { LogoOpenBadge },
  data () {
    return {
      mini: false,
      locales: [
        { name: 'Français', value: 'fr' },
        { name: 'English', value: 'en' }
      ],
      links: [
        { icon: 'mdi-home-variant', href: 'http://www.ezpaarse.org/' },
        { icon: 'mdi-email', href: 'mailto:ezpaarse@couperin.org' },
        { icon: 'mdi-twitter-box', href: 'https://twitter.com/ezpaarse' },
        { icon: 'mdi-comment-text-outline', href: 'http://blog.ezpaarse.org/' },
        { icon: 'mdi-youtube', href: 'https://www.youtube.com/channel/UCcR-0UE9WjYiwS4fMG2T4tQ' }
      ]
    }
  },
  computed: {
    drawer: {
      get () { return this.$store.state.drawer },
      set (newVal) { this.$store.dispatch('SET_DRAWER', newVal) }
    },
    appVersion () {
      return this.$store.state.app.version
    },
    trelloLink () {
      return `https://trello.com/b/${this.$store.state.app.boardId}`
    },
    user () {
      return this.$store.state.user
    },
    avatarUrl () {
      if (this.user && this.user.avatarHash) {
        return `https://trello-avatars.s3.amazonaws.com/${this.user.avatarHash}/50.png`
      }
    },
    loginUrl () {
      return `/api/auth/connect/trello?callback=/api/auth/callback${this.$route.fullPath}`
    },
    dark: {
      get () { return this.$store.state.dark },
      set (newVal) { this.$store.dispatch('SET_DARK', newVal) }
    },
    page () {
      return this.$route.query.page
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('LOGOUT')
    }
  }
}
</script>

<style scoped>
a { color: inherit; }
.bottomList {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>