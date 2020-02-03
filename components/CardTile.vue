<template>
  <v-list-item ripple router :to="{ name: 'platforms-cid', params: { cid: card.id }}" v-if="!card.closed || displayAllCards">
    <v-list-item-content>
      <v-list-item-title>
        <v-tooltip right v-if="card.closed">
          <template v-slot:activator="{ on }">
            <span v-on="on">
              <v-icon size="24" class="mb-1">mdi-archive</v-icon>
              {{ card.name }}
            </span>
          </template>
          <span v-text="$t('card.archived')"></span>
        </v-tooltip>
        <span v-else v-text="card.name"></span>
      </v-list-item-title>
      <v-list-item-subtitle>{{ listName }}</v-list-item-subtitle>
      <v-list-item-subtitle>{{ $t('card.nbAnalyses', { n: nbAnalyses }) }}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-list-item-subtitle class="caption">{{ updatedAt }}</v-list-item-subtitle>
      <span>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-list-item-avatar v-on="on" class="cert-icon" size="24" v-if="humanCertified" color="#F4B48B">
              <span class="white--text">H</span>
            </v-list-item-avatar>
          </template>
          <span v-text="$t('certifications.humanCert')"></span>
        </v-tooltip>
      </span>
      <span>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-list-item-avatar v-on="on" class="cert-icon" size="24" v-if="publisherCertified" color="#5AB9C1">
              <span class="white--text">P</span>
            </v-list-item-avatar>
          </template>
          <span v-text="$t('certifications.publisherCert')"></span>
        </v-tooltip>
      </span>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import moment from 'moment'

export default {
  props: ['card'],
  computed: {
    displayAllCards () {
      return this.$store.state.displayAllCards
    },
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
    humanCertified () {
      if (this.card.platform) {
        const humanCertifications = []
        this.card.platform.humanCertifications.forEach(certification => {
          if (certification.status === 'accepted') humanCertifications.push(certification)
        })
        return humanCertifications.length > 0
      }
      return false
    },
    publisherCertified () {
      if (this.card.platform) {
        const publisherCertifications = []
        this.card.platform.publisherCertifications.forEach(certification => {
          if (certification.status === 'accepted') publisherCertifications.push(certification)
        })
        publisherCertifications.sort((a, b) => a.form.year < b.form.year)
        return publisherCertifications.length > 0
      }
      return false
    }
  }
}
</script>
