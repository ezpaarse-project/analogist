<template>
  <v-toolbar class="red accent-3">
    <v-toolbar-title>AnalogIST</v-toolbar-title>
    <v-toolbar-items>
      <v-toolbar-item router href="/" ripple>Plateformes</v-toolbar-item>
      <v-toolbar-item :href="trelloLink" ripple>Tableau Trello</v-toolbar-item>

      <v-menu bottom origin="top right">
        <v-btn icon slot="activator">
          <v-icon>account_circle</v-icon>
        </v-btn>
        <v-list v-if="user">
          <v-subheader v-text="user.fullName"></v-subheader>
          <v-list-item>
            <v-list-tile v-on:click.native="logout">
              <v-list-tile-title>Se déconnecter</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
        </v-list>
        <v-list v-else>
          <v-subheader>Non connecté</v-subheader>
          <v-list-item>
            <v-list-tile :href="loginUrl">
              <v-list-tile-title>Se connecter</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
export default {
  computed: {
    trelloLink () {
      return `https://trello.com/b/${this.$store.state.app.boardId}`
    },
    user () {
      return this.$store.state.user
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