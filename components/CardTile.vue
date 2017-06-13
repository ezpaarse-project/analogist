<template>
  <v-list-item>
    <v-list-tile avatar ripple router :href="{ name: 'platforms-cid', params: { cid: card.id }}">
      <v-list-tile-content>
        <v-list-tile-title>{{ card.name }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ listName }}</v-list-tile-sub-title>
        <v-list-tile-sub-title>{{ $t('card.nbAnalyses', { n: nbAnalyses }) }}</v-list-tile-sub-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-list-tile-action-text>{{ updatedAt }}</v-list-tile-action-text>
        <img class="cert-icon" src="~assets/img/certif_h.png" v-if="card.humanCertified" :title="$t('card.humanCertification')">
        <img class="cert-icon" src="~assets/img/certif_p.png" v-if="card.publisherCertified" :title="$t('card.publisherCertification')">
      </v-list-tile-action>
    </v-list-tile>
  </v-list-item>
</template>

<script>
import moment from 'moment'

export default {
  props: ['card'],
  computed: {
    updatedAt () {
      return moment(this.card.lastActivity).locale(this.$i18n.locale).fromNow()
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
