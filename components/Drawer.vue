<template>
  <v-navigation-drawer app fixed disable-route-watcher :mini-variant="mini" v-model="drawer">
    <v-list dark class="pa-1 red accent-3" v-if="!mini">
      <v-list-tile avatar tag="div">
        <v-list-tile-avatar>
          <img src="~/assets/img/logo-white.svg" />
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>AnalogIST</v-list-tile-title>
          <v-list-tile-sub-title>
            <v-menu>
              <span flat slot="activator">
                Version: {{ appVersion }} <v-icon dark>mdi-menu-down</v-icon>
              </span>
              <v-list>
                <v-list-tile href="https://github.com/ezpaarse-project/analogist#readme" target="_blank">
                  <v-list-tile-action>
                    <v-icon>mdi-github-box</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-content>
                    GitHub
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-layout row justify-center v-if="!mini">
      <v-btn icon target="_blank" v-for="link in links" :title="link.title" :href="link.href" :key="link.icon">
        <v-icon>{{ link.icon }}</v-icon>
      </v-btn>
    </v-layout>

    <v-divider/>

    <v-list class="pa-1">
      <v-list-tile v-if="mini" @click="mini = !mini">
        <v-list-tile-action>
          <v-icon light>mdi-chevron-right</v-icon>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile avatar tag="div">
        <v-list-tile-avatar>
          <img v-if="avatarUrl" :src="avatarUrl" />
          <v-icon large v-else>mdi-account-circle</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title v-if="user">{{ user.fullName }}</v-list-tile-title>
          <v-list-tile-title v-else>{{ $t('drawer.notConnected') }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon @click="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-list class="pt-0">
      <v-divider/>
      <v-list-tile router exact :to="{ path: '/' }" ripple>
        <v-list-tile-action>
          <v-icon>mdi-file-powerpoint-box</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.platforms') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :href="trelloLink" target="_blank">
        <v-list-tile-action>
          <v-icon>mdi-trello</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.trelloBoard') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile router exact :to="{ path: '/ezlogger' }" ripple>
        <v-list-tile-action>
          <v-icon>mdi-file-find</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.ezLogger') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-group
        prepend-icon="mdi-translate"
        append-icon="mdi-chevron-down"
        v-if="!mini"
      >
        <v-list-tile slot="activator">
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('drawer.language') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-for="lang in locales" :key="lang.value" @click="$i18n.locale = lang.value">
          <v-list-tile-content>
            <v-list-tile-title>{{ lang.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list-group>

      <v-list-tile v-if="!user" :href="loginUrl">
        <v-list-tile-action>
          <v-icon>mdi-login</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.login') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-else @click="logout">
        <v-list-tile-action>
          <v-icon>mdi-logout</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.logout') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data () {
    return {
      mini: false,
      locales: [
        { name: 'Français', value: 'fr' },
        { name: 'English', value: 'en' }
      ],
      links: [
        { icon: 'mdi-home', href: 'http://www.ezpaarse.org/' },
        { icon: 'mdi-email', href: 'mailto:ezpaarse@couperin.org' },
        { icon: 'mdi-twitter-box', href: 'https://twitter.com/ezpaarse' },
        { icon: 'mdi-facebook-box', href: 'https://www.facebook.com/Ezpaarse' },
        { icon: 'mdi-comment-text-outline', href: 'http://blog.ezpaarse.org/' },
        { icon: 'mdi-youtube-play', href: 'https://www.youtube.com/channel/UCcR-0UE9WjYiwS4fMG2T4tQ' }
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
  a { color: inherit }
</style>