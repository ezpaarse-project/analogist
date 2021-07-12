<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    clipped
    fixed
    disable-route-watcher
    width="300"
  >
    <v-list class="text-center">
      <v-btn
        v-for="link in links"
        :key="link.icon"
        class="ml-2 mr-2"
        icon
        target="_blank"
        :aria-label="link.title"
        :title="link.title"
        :href="link.href"
        rel="noreferrer"
      >
        <v-icon dark>
          {{ link.icon }}
        </v-icon>
      </v-btn>
    </v-list>

    <v-divider />

    <v-list>
      <v-list-item
        v-if="!user"
        link
        router
        :href="loginUrl"
      >
        <v-list-item-avatar>
          <v-icon large>
            mdi-account-circle
          </v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title
            class="subtitle-2 font-weight-regular"
            v-text="$t('drawer.login')"
          />
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-else>
        <v-list-item-avatar v-if="user.avatarUrl">
          <img
            :title="user.fullName"
            :src="user.avatarUrl + '/50.png'"
            alt="Avatar"
          >
        </v-list-item-avatar>
        <v-list-item-avatar
          v-if="!user.avatarUrl"
          color="blue-grey lighten-4"
        >
          <span
            class="white--text headline"
            v-text="user.initials"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title
            class="subtitle-2 font-weight-regular"
            v-text="user.fullName"
          />
          <v-list-item-subtitle v-if="!canEdit">
            <v-dialog
              v-model="becomeMemberDialog"
              max-width="600"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  x-small
                  color="blue darken-1"
                  dark
                  v-on="on"
                  v-text="$t('drawer.newUserButton')"
                />
              </template>
              <v-card>
                <v-card-text class="text-center py-3">
                  <p
                    class="headline"
                    v-text="$t('drawer.newUser')"
                  />
                  <p>
                    {{ $t('drawer.newUserText') }}
                  </p>
                  <v-btn
                    color="green darken-1"
                    dark
                    @click="newUserRequest"
                    v-text="$t('drawer.becomeMember')"
                  />
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-icon>
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-btn
                text
                icon
                :aria-label="$t('drawer.logout')"
                v-on="on"
                @click="logout"
              >
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('drawer.logout') }}</span>
          </v-tooltip>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list pt-0>
      <v-list-item
        link
        router
        :to="{ path: '/' }"
        ripple
      >
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title
            class="subtitle-2 font-weight-regular"
            v-text="$t('drawer.home')"
          />
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        router
        :to="{ path: '/platforms' }"
        ripple
      >
        <v-list-item-icon>
          <v-icon>mdi-file-powerpoint-box</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title
            class="subtitle-2 font-weight-regular"
            v-text="$t('drawer.platforms')"
          />
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :href="trelloLink"
        target="_blank"
        rel="noreferrer"
      >
        <v-list-item-icon>
          <v-icon>mdi-trello</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title
            class="subtitle-2 font-weight-regular"
            v-text="$t('drawer.trelloBoard')"
          />
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        router
        :to="{ path: '/ezlogger' }"
        ripple
      >
        <v-list-item-icon>
          <v-icon>mdi-file-find</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title
            class="subtitle-2 font-weight-regular"
            v-text="$t('drawer.ezLogger')"
          />
        </v-list-item-content>
      </v-list-item>

      <v-list-group
        v-if="badgesEnabled"
        no-action
        append-icon="mdi-chevron-down"
        :value="$nuxt.$route.name.indexOf('badges') !== -1"
      >
        <template v-slot:activator>
          <v-list-item-icon>
            <logo-open-badge />
          </v-list-item-icon>
          <v-list-item-title class="subtitle-2 font-weight-regular">
            OpenBadges
          </v-list-item-title>
        </template>

        <v-list-item
          v-if="user"
          router
          :to="{ path: '/badges/view' }"
          ripple
        >
          <v-list-item-title class="subtitle-2 font-weight-regular">
            {{ $t('drawer.badges') }}
          </v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-wallet-membership</v-icon>
          </v-list-item-icon>
        </v-list-item>

        <v-list-item
          router
          :to="{ path: '/badges/list' }"
          ripple
        >
          <v-list-item-title class="subtitle-2 font-weight-regular">
            {{ $t('badges.list') }}
          </v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted-square</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>

      <v-list-group
        v-if="user && user.role === 'admin'"
        no-action
        append-icon="mdi-chevron-down"
        :value="$nuxt.$route.name.indexOf('admin') !== -1"
      >
        <template v-slot:activator>
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="subtitle-2 font-weight-regular">
            Administration
          </v-list-item-title>
        </template>

        <v-list-item
          v-if="user && user.role === 'admin'"
          router
          :to="{ path: '/admin/certifications' }"
          ripple
        >
          <v-list-item-title class="subtitle-2 font-weight-regular">
            Certifications
          </v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-wallet-membership</v-icon>
          </v-list-item-icon>
        </v-list-item>

        <v-list-item
          v-if="user && user.role === 'admin' && badgesEnabled"
          router
          :to="{ path: '/admin/emit' }"
          ripple
        >
          <v-list-item-title class="subtitle-2 font-weight-regular">
            {{ $t('badges.emitBadge') }}
          </v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-send</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>

      <v-list-group
        no-action
        append-icon="mdi-chevron-down"
        prepend-icon="mdi-translate"
      >
        <template v-slot:activator>
          <v-list-item-title class="subtitle-2 font-weight-regular">
            {{ $t('drawer.language') }}
          </v-list-item-title>
        </template>

        <v-list-item
          v-for="locale in $i18n.locales"
          :key="locale.code"
          @click="$i18n.setLocale(locale.code)"
        >
          <v-list-item-title
            class="body-2"
            v-text="locale.name"
          />
          <v-list-item-icon>
            <img
              width="24"
              :src="require(`@/static/${locale.code}.png`)"
              :alt="locale.name"
            >
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>
    </v-list>

    <template v-slot:append>
      <div class="pa-2 text-center">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              small
              text
              icon
              :aria-label="$t('theme.light')"
              v-on="on"
              @click="$vuetify.theme.dark = !$vuetify.theme.dark"
            >
              <v-icon v-if="$vuetify.theme.dark">
                mdi-white-balance-sunny
              </v-icon>
              <v-icon v-else>
                mdi-weather-night
              </v-icon>
            </v-btn>
          </template>
          <span v-if="$vuetify.theme.dark">{{ $t('theme.light') }}</span>
          <span v-else>{{ $t('theme.dark') }}</span>
        </v-tooltip>

        <v-spacer />

        <v-btn
          small
          class="ma-3"
          href="https://github.com/ezpaarse-project/analogist#readme"
          target="_blank"
          rel="noreferrer"
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
        { icon: 'mdi-home-variant', href: 'http://www.ezpaarse.org/', title: 'ezPAARSE' },
        { icon: 'mdi-email', href: 'mailto:ezpaarse@couperin.org', title: 'Contact' },
        { icon: 'mdi-twitter', href: 'https://twitter.com/ezpaarse', title: 'Twitter' },
        { icon: 'mdi-comment-text-outline', href: 'http://blog.ezpaarse.org/', title: 'Blog' },
        { icon: 'mdi-youtube', href: 'https://www.youtube.com/channel/UCcR-0UE9WjYiwS4fMG2T4tQ', title: 'Youtube' }
      ],
      becomeMemberDialog: false,
      appVersion: this.$nuxt.context.env.version,
      badgesEnabled: this.$nuxt.context.env.badgesEnabled,
      trelloLink: `https://trello.com/b/${this.$nuxt.context.env.boardId}`
    }
  },
  computed: {
    drawer: {
      get () { return this.$store.state.drawer },
      set (newVal) { this.$store.dispatch('SET_DRAWER', newVal) }
    },
    user () {
      return this.$auth.$state.user
    },
    loginUrl () {
      return `/api/auth/connect/trello?callback=/api/auth/callback${this.$route.fullPath}`
    },
    page () {
      return this.$route.query.page
    },
    canEdit () {
      return this.$auth.$state.user && this.$auth.$state.user.isAuthorized
    }
  },
  methods: {
    async logout () {
      await this.$auth.logout()
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
