<template>
  <v-list-item>
    <v-list-item-avatar color="#5AB9C1">
      <span class="white--text headline" v-text="name"></span>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <v-menu open-on-hover offset-y>
          <template v-slot:activator="{ on }">
            <v-btn small v-on="on" class="dateLbl white--text" color="#5AB9C1" depressed :disabled="!user || !canCertify || !humanCertified">
              <span v-if="publisherCertified">{{ year }}</span>
              <span v-else>-</span>
            </v-btn>
          </template>
          <v-list v-if="user && humanCertified">
            <v-list-item v-for="(item, index) in years" :key="index">
              <v-list-item-title class="pointer" @click="openDialog(item);">{{ item || '-' }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <span v-if="publisherCertified"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.publisherVerified') }}</a></span>
        <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  props: [ 'years' ],
  data () {
    return {
      name: 'P'
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    user () {
      return this.$store.state.user
    },
    humanCertified () {
      if (this.card.platform) {
        const humanCertifications = []
        this.card.platform.humanCertifications.forEach(certification => {
          if (certification.status === 'accepted') humanCertifications.push(certification)
        })
        humanCertifications.sort((a, b) => a.form.year < b.form.year)
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
    },
    year () {
      return this.publisherCertified ? this.card.platform.publisherCertifications[0].form.year : null
    },
    canCertify () {
      return this.card.platform && this.card.platform.analyses && this.card.platform.analyses.length > 0
    }
  },
  methods: {
    openDialog (year) {
      this.$emit('openDialog', false, true, year)
    }
  }
}
</script>