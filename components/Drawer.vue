<template>
  <v-navigation-drawer enable-resize-watcher disable-route-watcher persistent :mini-variant="mini" v-model="drawer">
    <v-list class="pa-1">
      <v-list-tile v-if="mini" @click.native.stop="mini = !mini">
        <v-list-tile-action>
          <v-icon light>chevron_right</v-icon>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile avatar tag="div">
        <v-list-tile-avatar>
          <img v-if="avatarUrl" :src="avatarUrl" />
          <v-icon large v-else>account_circle</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title v-if="user">{{ user.fullName }}</v-list-tile-title>
          <v-list-tile-title v-else>{{ $t('drawer.notConnected') }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon @click.native.stop="mini = !mini">
            <v-icon>chevron_left</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-list class="pt-0">
      <v-divider></v-divider>
      <v-list-tile router :to="{ path: '/' }" ripple>
        <v-list-tile-action>
          <v-icon>find_in_page</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.platforms') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile :href="trelloLink" target="_blank">
        <v-list-tile-action>
          <v-icon>dashboard</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.trelloBoard') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-group>
        <v-list-tile slot="item">
          <v-list-tile-action>
            <v-icon>language</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('drawer.language') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon>keyboard_arrow_down</v-icon>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-for="lang in locales" :key="lang.value" v-on:click.native="$i18n.locale = lang.value">
          <v-list-tile-content>
            <v-list-tile-title>{{ lang.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list-group>

      <v-list-tile v-if="!user" :href="loginUrl">
        <v-list-tile-action>
          <v-icon>exit_to_app</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('drawer.login') }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-else v-on:click.native="logout">
        <v-list-tile-action>
          <v-icon>power_settings_new</v-icon>
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
      ]
    }
  },
  computed: {
    drawer: {
      get () { return this.$store.state.drawer },
      set (newVal) { this.$store.dispatch('SET_DRAWER', newVal) }
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