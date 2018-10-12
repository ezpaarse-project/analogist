<template>
  <v-layout row wrap justify-center>
    <v-flex xs12 sm12>
      <v-switch
        style="float: right"
        label="Public"
        v-model="visibility"
        @change="setVisiblity"
      ></v-switch>
    </v-flex>
    
    <v-flex xs12 sm2 v-if="badges && ping" v-for="badge in badges" :key="badge.id" @click="currentBadge = badge; linkedInModal = false" :class="{ 'notPossessed' : !badge.issued_on }">
      <img class="mx-auto badgeImage" :src="badge.image" width="60%">
      <h4 class="badgeName" v-if="$i18n.locale === 'fr'">{{ badge.name }}</h4>
      <h4 class="badgeName" v-else>{{ badge.alt_language[$i18n.locale].name }}</h4>
    </v-flex>

    <v-flex xs12 sm12 v-if="!ping">
      <v-card class="red white--text">
        <v-card-text>
          {{ $t('badges.error') }}
        </v-card-text>
      </v-card>
    </v-flex>

    <v-dialog v-if="currentBadge && !linkedInModal" v-model="currentBadge" max-width="600px">
      <badge-card :badge="currentBadge" :userId="user.id" @closeCard="closeCard" @linkedIn="linkedIn"></badge-card>
    </v-dialog>
  
    <v-dialog v-if="linkedInModal && currentBadge" v-model="currentBadge" max-width="600px">
      <linked-in-card :badge="currentBadge" :userId="user.id" @closeLinkedInCard="closeLinkedInCard"></linked-in-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import BadgeCard from '~/components/badges/BadgeCard'
import LinkedInCard from '~/components/badges/LinkedInCard'

export default {
  props: ['badges', 'visibility', 'ping', 'user'],
  components: {
    BadgeCard,
    LinkedInCard
  },
  data () {
    return {
      modal: false,
      currentBadge: null,
      linkedInModal: false,
      visible: false
    }
  },
  methods: {
    closeCard () {
      this.currentBadge = null
      this.linkedInModal = false
    },
    linkedIn () {
      this.linkedInModal = true
    },
    closeLinkedInCard () {
      this.linkedInModal = false
      this.currentBadge = null
    },
    setVisiblity () {
      this.$store.dispatch('badges/setVisiblity', this.visibility)
    }
  }
}
</script>

<style scoped>
.badgeImage {
  display: block; 
  margin: auto;
  cursor: pointer;
}
.badgeName {
  text-align: center;
  cursor: pointer;
}
.notPossessed {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.5s ease-in-out;
}
.notPossessed:hover {
  filter: grayscale(0%);
  opacity: 1;
}
</style>
