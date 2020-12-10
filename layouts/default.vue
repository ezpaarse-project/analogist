<template>
  <v-app
    id="analogist"
    :dark="dark"
  >
    <AppDrawer />
    <AppHeader />

    <v-main>
      <v-container fluid>
        <nuxt class="px-3" />
        <Snackbar />
      </v-container>
    </v-main>
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
  },
  head () {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale
      }
    }
  }
}
</script>
