<template>
  <v-app-bar app dark fixed clipped-left color="primary">
    <v-app-bar-nav-icon @click.stop="setDrawer(!drawer)">
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>
    <v-toolbar-title>
      <img class="analogistLogo" src="@/static/logo-white.svg" />
      AnalogIST
    </v-toolbar-title>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  computed: mapState([
    'drawer'
  ]),
  methods: mapActions({
    'setDrawer': 'SET_DRAWER'
  })
}
</script>

<style scoped>
  .analogistLogo {
    width: 32px;
    height: 32px;
    vertical-align: middle;
  }
</style>

