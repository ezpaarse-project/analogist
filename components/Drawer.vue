<template>
  <v-navigation-drawer v-model="drawer" app clipped fixed disable-route-watcher width="300">
    <v-list class="text-center">
      <v-btn class="ml-2 mr-2" icon target="_blank" v-for="link in links" :title="link.title" :href="link.href" :key="link.icon">
        <v-icon dark>{{ link.icon }}</v-icon>
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
        <v-list-item-avatar v-if="user.avatarHash">
          <img :title="user.fullName" :src="user.avatarUrl + '/50.png'" alt="Avatar" />
        </v-list-item-avatar>
        <v-list-item-avatar color="blue-grey lighten-4" v-if="!user.avatarHash">
          <span class="white--text headline" v-text="user.initials"></span>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="subtitle-2 font-weight-regular" v-text="user.fullName"></v-list-item-title>
          <v-list-item-subtitle v-if="!canEdit">
            <v-dialog v-model="becomeMemberDialog" max-width="600">
              <template v-slot:activator="{ on }">
                <v-btn x-small v-on="on" color="blue darken-1" dark v-text="$t('drawer.newUserButton')"></v-btn>
              </template>
              <v-card>
                <v-card-text class="text-center py-3">
                  <p class="headline" v-text="$t('drawer.newUser')"></p>
                  <p v-html="$t('drawer.newUserText')"></p>
                  <v-btn color="green darken-1" dark @click="newUserRequest" v-text="$t('drawer.becomeMember')"></v-btn>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-list-item-subtitle>
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

        <v-list-item router :to="{ path: '/badges/list' }" ripple>
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ $t('badges.list') }}</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted-square</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>

      <v-list-group v-if="user && user.role === 'admin'" no-action append-icon="mdi-chevron-down" :value="$nuxt.$route.name.indexOf('admin') !== -1">
        <template v-slot:activator>
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="subtitle-2 font-weight-regular">Administration</v-list-item-title>
        </template>

        <v-list-item v-if="user && user.role === 'admin'" router :to="{ path: '/admin/certifications' }" ripple>
          <v-list-item-title class="subtitle-2 font-weight-regular">Certifications</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-wallet-membership</v-icon>
          </v-list-item-icon>
        </v-list-item>

        <v-list-item v-if="user && user.role === 'admin'" router :to="{ path: '/admin/emit' }" ripple>
          <v-list-item-title class="subtitle-2 font-weight-regular">{{ $t('badges.emitBadge') }}</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-send</v-icon>
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

    <template v-slot:append>
      <div class="pa-2 text-center">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn small text icon v-on="on" @click="$vuetify.theme.dark = !$vuetify.theme.dark">
              <v-icon v-if="$vuetify.theme.dark">mdi-white-balance-sunny</v-icon>
              <v-icon v-else>mdi-weather-night</v-icon>
            </v-btn>
          </template>
          <span v-if="$vuetify.theme.dark">{{ $t('theme.light') }}</span>
          <span v-else>{{ $t('theme.dark') }}</span>
        </v-tooltip>

        <v-spacer></v-spacer>

        <v-btn
          small
          class="ma-3"
          href="https://github.com/ezpaarse-project/analogist#readme"
          target="_blank"
          outlined
        >
          Version: {{ appVersion }}
          <v-icon right>
            mdi-github
          </v-icon>
        </v-btn>
      </div>
    </template>
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
        { icon: 'mdi-twitter', href: 'https://twitter.com/ezpaarse' },
        { icon: 'mdi-comment-text-outline', href: 'http://blog.ezpaarse.org/' },
        { icon: 'mdi-youtube', href: 'https://www.youtube.com/channel/UCcR-0UE9WjYiwS4fMG2T4tQ' }
      ],
      becomeMemberDialog: false
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
        return `${this.user.avatarUrl}/50.png`
      }
    },
    loginUrl () {
      return `/api/auth/connect/trello?callback=/api/auth/callback${this.$route.fullPath}`
    },
    page () {
      return this.$route.query.page
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('LOGOUT')
    },
    newUserRequest () {
      this.$store.dispatch('BECOME_MEMBER')
        .then(() => this.$store.dispatch('snacks/success', 'drawer.becomeMemberSuccess'))
        .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))
      this.becomeMemberDialog = false
    }
  }
}
</script>

<style scoped>
a { color: inherit; }
</style>
