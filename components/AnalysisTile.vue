<template>
  <v-list-item
    router
    :to="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: analysis.id } }"
  >
    <v-list-item-avatar>
      <v-avatar
        size="36"
        color="grey lighten-1"
      >
        <img
          v-if="updatedBy && updatedBy.avatarUrl"
          :title="updatedBy.fullName"
          :src="updatedBy.avatarUrl + '/50.png'"
          alt="avatar"
        >
        <span
          v-else-if="updatedBy && updatedBy.initials"
          class="subtitle-1 white--text"
          :title="updatedBy.fullName"
          v-text="updatedBy.initials"
        />
        <v-icon v-else>
          mdi-account-question
        </v-icon>
      </v-avatar>
    </v-list-item-avatar>

    <v-list-item-content :class="visited ? 'primary--text' : ''">
      <v-list-item-title v-text="analysis.title" />
      <v-list-item-subtitle>{{ analysis.rtype || '-' }} / {{ analysis.mime || '-' }}</v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action>
      <v-list-item-action-text v-if="analysis.updatedAt">
        {{ updatedAt }}
      </v-list-item-action-text>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  props: {
    analysis: {
      type: Object,
      default: () => ({})
    },
    cardID: {
      type: String,
      default: () => ('')
    }
  },
  computed: {
    updatedAt () {
      return this.$dateFns.formatDistanceToNow(this.analysis.updatedAt)
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
