<template>
  <v-app id="analogist" toolbar footer>
    <AppDrawer/>
    <AppHeader/>
    <main>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </main>
    <AppFooter/>
  </v-app>
</template>

<script>
import AppFooter from '~/components/Footer.vue'
import AppHeader from '~/components/Header.vue'
import AppDrawer from '~/components/Drawer.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
    AppDrawer
  }
}
</script>

<style>
</style>
