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

    <v-spacer></v-spacer>

    <v-btn
      v-if="user && user.role === 'admin'"
      class="my-2"
      small
      :loading="loading"
      :disabled="loading"
      @click="loading = true; modal = true"
    >
      Historique
    </v-btn>

    <v-dialog
      v-model="modal"
      max-width="600px"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-text>
          <v-timeline dense clipped>
            <v-timeline-item
              hide-dot
              class="headline"
              large
            >
              <p class="headline mt-5">Historique de la plateforme</p>
            </v-timeline-item>

            <v-timeline-item
              color="green"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Validation de la certification par <strong>John Doe</strong></v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>

            <v-timeline-item
              color="purple"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Tester dans ezPAARSE Logger</v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>

            <v-timeline-item
              color="brown"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Mise à jour de la plateforme</v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>

            <v-timeline-item
              color="orange"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Analyse déplacée en <strong>4 - Parseur d'URLs en dev</strong></v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>

            <v-timeline-item
              color="grey"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Demande de certification par <strong>John Doe</strong> pour l'année <strong>2018</strong></v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>

            <v-timeline-item
              color="red"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Certification retirée par <strong>John Doe</strong></v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>

            <v-timeline-item
              color="blue"
              icon-color="grey lighten-2"
              small
            >
              <v-row justify="space-between">
                <v-col cols="9">Approbation de la certification par <strong>CNRS</strong></v-col>
                <v-col class="text-right" cols="3">22/01/2020</v-col>
              </v-row>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script>
export default {
  props: [ 'years' ],
  data () {
    return {
      name: 'H',
      loading: false,
      modal: false,
      events: [],
      input: null,
      nonce: 0
    }
  },
  computed: {
    timeline () {
      return this.events.slice().reverse()
    },
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
