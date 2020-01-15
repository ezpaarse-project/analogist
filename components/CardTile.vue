<template>
  <v-list-item ripple router :to="{ name: 'platforms-cid', params: { cid: card.id }}">
    <v-list-item-content>
      <v-list-item-title>{{ card.name }}</v-list-item-title>
      <v-list-item-subtitle>{{ listName }}</v-list-item-subtitle>
      <v-list-item-subtitle>{{ $t('card.nbAnalyses', { n: nbAnalyses }) }}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-list-item-subtitle class="caption">{{ updatedAt }}</v-list-item-subtitle>
      <span>
        <v-list-item-avatar class="cert-icon" size="24" v-if="humanCertified" color="#F4B48B">
          <span class="white--text">H</span>
        </v-list-item-avatar>
      </span>
      <span>
        <v-list-item-avatar class="cert-icon" size="24" v-if="publisherCertified" color="#5AB9C1">
          <span class="white--text">P</span>
        </v-list-item-avatar>
      </span>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import moment from 'moment'

export default {
  props: [ 'card' ],
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
    },
    certified () {
      return this.card.platform && this.card.platform.certifications
    },
    humanCertified () {
      return this.certified ? this.card.platform.certifications.humanCertified : null
    },
    humanCertification () {
      return this.card.platform.certifications.humanCertified
    },
    publisherCertified () {
      return this.certified ? this.card.platform.certifications.publisherCertified : null
    },
    publisherCertification () {
      return this.card.platform.certifications.publisherCertified
    }
  }
}
</script>
