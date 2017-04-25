<template>
  <v-list-item>
    <v-list-tile avatar ripple router :href="{ name: 'platforms-cid', params: { cid: card.id }}">
      <v-list-tile-content>
        <v-list-tile-title>{{ card.name }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ listName }}</v-list-tile-sub-title>
        <v-list-tile-sub-title>{{ nbAnalyses }} analyses</v-list-tile-sub-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-list-tile-action-text>{{ lastActivity }}</v-list-tile-action-text>
        <v-icon v-if="card.humanCertified" class="grey--text text--lighten-1" title="Certification manuelle">star</v-icon>
        <v-icon v-if="card.publisherCertified" class="amber--text" title="Certification éditeur">star</v-icon>
      </v-list-tile-action>
    </v-list-tile>
  </v-list-item>
</template>

<script>
export default {
  props: ['card'],
  computed: {
    lastActivity () {
      return new Date(this.card.dateLastActivity).toLocaleString()
    },
    nbAnalyses () {
      try {
        return this.card.platform.analyses.length
      } catch (e) {
        return 0
      }
    },
    listName () {
      return this.list && this.list.name
    },
    list () {
      return this.$store.state.trelloLists.find(l => this.card.idList === l.id)
    }
  }
}
</script>

<style scoped>
  a { color: inherit }
</style>