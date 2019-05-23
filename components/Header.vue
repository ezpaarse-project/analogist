<template>
  <v-toolbar app dark fixed clipped-left color="primary">
    <v-toolbar-side-icon @click.stop="setDrawer(!drawer)">
      <v-icon>mdi-menu</v-icon>
    </v-toolbar-side-icon>
    <v-toolbar-title>
      <img class="analogistLogo" src="~/assets/img/logo-white.svg" /> 
      AnalogIST
    </v-toolbar-title>
  </v-toolbar>
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

