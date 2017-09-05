<template>
  <v-app id="analogist" toolbar>
    <AppDrawer/>
    <AppHeader/>
    <main>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import AppHeader from '~/components/Header.vue'
import AppDrawer from '~/components/Drawer.vue'

export default {
  components: {
    AppHeader,
    AppDrawer
  }
}
</script>
