<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap>
     <v-flex xs12 sm6>
        <v-select
          :label="$t('badges.users')"
          :items="trelloBoardMembers"
          v-model="currentBoardMember"
          item-text="member.fullName"
          append-icon="mdi-account"
          single-line
          return-object
        >
          <template slot="item" slot-scope="data">
            <v-list-tile-content>
              <v-list-tile-title v-html="data.item.member.fullName"></v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-select>
      </v-flex>

      <v-flex xs12 sm6>
        <v-select
          label="Badge(s)"
          :items="badges"
          v-model="currentBadge"
          item-text="name"
          append-icon="mdi-seal"
          single-line
          return-object
        >
          <template slot="item" slot-scope="data">
            <v-list-tile-content>
              <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-select>
      </v-flex>

      <v-flex xs12 sm12>
        <v-text-field
          label="Email"
          append-icon="mdi-email"
          type="email"
          v-model="email"
        ></v-text-field>
      </v-flex>

      <v-flex xs12 sm12>
        <v-btn large block color="success" @click="emit">{{$t('badges.emitBadge')}}</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['user', 'trelloBoardMembers', 'badges'],
  data () {
    return {
      currentBoardMember: null,
      currentBadge: null,
      email: null
    }
  },
  methods: {
    emit () {
      this.$socket.emit('ADD_TO_ROOM', { userId: this.currentBoardMember.idMember })

      this.email = null
      this.currentBadge = null
      this.currentBoardMember = null

      this.$store.dispatch('badges/emit', {
        event: {
          badgeId: this.currentBadge.id,
          name: this.currentBadge.name
        },
        profile: {
          id: this.currentBoardMember.idMember,
          fullName: this.currentBoardMember.member.fullName,
          email: this.email
        }
      })
    }
  }
}
</script>
