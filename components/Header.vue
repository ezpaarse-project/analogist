<template>
  <v-toolbar class="red accent-3">
    <v-toolbar-title>AnalogIST</v-toolbar-title>
    <v-toolbar-items>
      <v-toolbar-item router href="/" ripple>Plateformes</v-toolbar-item>
      <v-toolbar-item :href="trelloLink" ripple>Tableau Trello</v-toolbar-item>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
export default {
  computed: {
    trelloLink () {
      return `https://trello.com/b/${this.$store.state.app.boardId}`
    }
  }
}
</script>

<style scoped>
  a { color: inherit }
</style>