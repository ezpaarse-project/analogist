<template>
  <v-toolbar app dark fixed class="red accent-3">
    <v-toolbar-side-icon @click.stop="setDrawer(!drawer)">
      <v-icon>mdi-menu</v-icon>
    </v-toolbar-side-icon>
    <v-toolbar-title>AnalogIST</v-toolbar-title>
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
