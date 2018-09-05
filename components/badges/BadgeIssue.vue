<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap>
     <v-flex xs12 sm6>
        <v-autocomplete
          v-model="currentBoardMember"
          :items="trelloBoardMembers"
          :label="$t('badges.users')"
          persistent-hint
          :no-data-text="$t('badges.userNotFound')"
          single-line
          return-object
          item-text="member.fullName"
          append-icon="mdi-chevron-down"
        >
          <template slot="items" slot-scope="{ item }">
            <v-list-tile-avatar>
              <img v-if="item.member.avatarHash" :src="`${item.member.avatarUrl}/50.png`">
              <span  v-else>
                <v-avatar color="blue-grey lighten-4">
                  <span class="white--text headline"><small>{{item.member.initials}}</small></span>
                </v-avatar>
              </span>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title v-html="item.member.fullName"></v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-autocomplete>
      </v-flex>
      
      <v-flex xs12 sm6>
        <v-autocomplete
          v-model="currentBadge"
          :items="badges"
          label="Badge(s)"
          persistent-hint
          :no-data-text="$t('badges.badgeNotFound')"
          single-line
          return-object
          item-text="name"
          append-icon="mdi-chevron-down"
        >
          <template slot="items" slot-scope="{ item }">
            <v-list-tile-avatar>
              <img :src="item.image">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title v-html="item.name"></v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-autocomplete>
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
        <v-btn large block color="success" @click="emit" :disabled="!email || !currentBadge || !currentBoardMember">{{$t('badges.emitBadge')}}</v-btn>
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

      this.email = null
      this.currentBadge = null
      this.currentBoardMember = null
    }
  }
}
</script>
