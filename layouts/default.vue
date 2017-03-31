<template>
  <v-app id="analogist" top-toolbar footer>
    <AppHeader/>
    <main>
      <v-content class="px-5 py-3">
        <nuxt/>
      </v-content>
    </main>
    <AppFooter/>
  </v-app>
</template>

<script>
import AppFooter from '~components/Footer.vue'
import AppHeader from '~components/Header.vue'

export default {
  components: {
    AppHeader,
    AppFooter
  }
}
</script>

<style>
</style>
