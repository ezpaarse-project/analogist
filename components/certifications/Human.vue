<template>
  <v-list-item>
    <v-list-item-avatar color="#F4B48B">
      <span class="white--text headline" v-text="name"></span>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <v-menu open-on-hover offset-y>
          <template v-slot:activator="{ on }">
            <v-btn small v-on="on" class="dateLbl white--text" color="#F4B48B" depressed :disabled="!user">
              <span v-if="humanCertified">{{ humanCertification }}</span>
              <span v-else>{{ years[0] }}</span>
            </v-btn>
          </template>
          <v-list v-if="user">
            <v-list-item v-for="(item, index) in years" :key="index">
              <v-list-item-title class="pointer" @click="openDialog(item)">{{ item }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <span v-if="humanCertified"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.manuallyVerified') }}</a></span>
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
      name: 'H'
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    user () {
      return this.$store.state.user
    },
    certified () {
      return this.card.platform && this.card.platform.certifications
    },
    humanCertified () {
      return this.certified ? this.card.platform.certifications.humanCertified : null
    },
    humanCertification () {
      return this.card.platform.certifications.humanCertified
    }
  },
  methods: {
    openDialog (year) {
      this.$emit('openDialog', this.name, year)
    }
  }
}
</script>
