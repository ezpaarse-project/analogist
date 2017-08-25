<template>
  <v-list-tile avatar router :to="{ name: 'platforms-cid-analyses-aid', params: { cid: $route.params.cid, aid: analysis.id } }">
    <v-list-tile-avatar>
      <img v-if="updatedBy && updatedBy.avatarHash" :title="updatedBy.fullName" :src="'https://trello-avatars.s3.amazonaws.com/' + updatedBy.avatarHash + '/50.png'" alt="avatar" />
      <span v-else-if="updatedBy" class="icon blue-grey lighten-4" :title="updatedBy.fullName" v-text="updatedBy.initials" />
    </v-list-tile-avatar>

    <v-list-tile-content>
      <v-list-tile-title v-text="analysis.title" />
      <v-list-tile-sub-title>{{ analysis.rtype || '-' }} / {{ analysis.mime || '-' }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-action>
      <v-list-tile-action-text v-if="analysis.updatedAt">{{ updatedAt }}</v-list-tile-action-text>
      <v-btn v-if="canEdit" flat icon ripple :loading="deleting" @click.native.prevent="deleteAnalysis()">
        <v-icon>delete</v-icon>
      </v-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import moment from 'moment'

export default {
  props: ['analysis', 'cardID'],
  data () {
    return {
      deleting: false
    }
  },
  computed: {
    updatedAt () {
      return moment(this.analysis.updatedAt).locale(this.$i18n.locale).fromNow()
    },
    canEdit () {
      return this.$store.state.user && this.$store.state.user.isAuthorized
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
    }
  },
  methods: {
    async deleteAnalysis () {
      this.deleting = true

      try {
        await this.$store.dispatch('DELETE_ANALYSIS', { cardID: this.cardID, analysisID: this.analysis.id })
      } catch (e) {
        // eslint-disable-next-line
        console.error('Analysis deletion failed', e)
        // TODO: handle error
      }

      this.deleting = false
    }
  }
}
</script>
