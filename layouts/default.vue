<template>
  <v-app id="analogist" :dark="dark">
    <AppDrawer />
    <AppHeader />

    <v-content>
      <v-container fluid>
        <nuxt class="pa-3" />
        <Snackbar/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppHeader from '~/components/Header.vue'
import AppDrawer from '~/components/Drawer.vue'
import Snackbar from '~/components/Snackbar.vue'

export default {
  components: {
    AppHeader,
    AppDrawer,
    Snackbar
  },
  computed: {
    dark () {
      return this.$store.state.dark
    }
  }
}
</script>
