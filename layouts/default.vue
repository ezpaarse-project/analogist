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
        <AppSnackbar />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppHeader from '~/components/AppHeader.vue'
import AppDrawer from '~/components/AppDrawer.vue'
import AppSnackbar from '~/components/AppSnackbar.vue'

export default {
  components: {
    AppHeader,
    AppDrawer,
    AppSnackbar
  },
  head () {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale
      }
    }
  },
  computed: {
    dark () {
      return this.$store.state.dark
    }
  }
}
</script>
