<template>
  <v-list-tile :value="visited" avatar router :to="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: analysis.id } }">
    <v-list-tile-avatar>
      <v-avatar size="36" color="grey lighten-1">
        <img v-if="updatedBy && updatedBy.avatarHash" :title="updatedBy.fullName" :src="'https://trello-avatars.s3.amazonaws.com/' + updatedBy.avatarHash + '/50.png'" alt="avatar" />
        <span v-else-if="updatedBy" class="subtitle-1 white--text" :title="updatedBy.fullName" v-text="updatedBy.initials" />
        <v-icon v-else>mdi-account-question</v-icon>
      </v-avatar>
    </v-list-tile-avatar>

    <v-list-tile-content>
      <v-list-tile-title v-text="analysis.title" />
      <v-list-tile-sub-title>{{ analysis.rtype || '-' }} / {{ analysis.mime || '-' }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-action>
      <v-list-tile-action-text v-if="analysis.updatedAt">{{ updatedAt }}</v-list-tile-action-text>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import moment from 'moment'

export default {
  props: ['analysis', 'cardID'],
  computed: {
    updatedAt () {
      return moment(this.analysis.updatedAt).locale(this.$i18n.locale).fromNow()
    },
    card () {
      return this.$store.state.card
    },
    updatedBy () {
      try {
        return this.card.members.find(m => m.id === this.analysis.updatedBy)
      } catch (e) {
        return null
      }
    },
    visited () {
      return this.$store.state.lastVisitedAnalysis === this.analysis.id
    }
  }
}
</script>
