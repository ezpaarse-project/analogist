<template>
  <v-app id="analogist">
    <AppDrawer/>
    <AppHeader/>
    <v-content>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </v-content>
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
