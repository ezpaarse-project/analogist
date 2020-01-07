<template>
  <span>
    <v-list-tile v-for="(year, certification) in certifications" :key="certification" :class="!year ? 'notCertified' : ''" avatar>
      <v-list-tile-avatar :color="certification === 'h' ? '#F4B48B' : '#5AB9C1'">
        <span class="white--text headline">{{certification.toUpperCase()}}</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title style="height: 32px;">
          <v-chip v-if="!user" small label :color="certification === 'h' ? '#F4B48B' : '#5AB9C1'" text-color="white">
            <span v-if="year">
              {{ year }}
            </span>
            <span v-else class="mdash">
              &mdash;
            </span>
          </v-chip>
          <v-menu offset-y v-else>
            <v-btn small slot="activator" class="chip dateBtn" :color="certification === 'h' ? '#F4B48B' : '#5AB9C1'" dark depressed>
              <span v-if="year">
                {{ year }}
              </span>
              <span v-else class="mdash">
                &mdash;
              </span>
              <v-icon class="menuDown">mdi-menu-down</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile v-for="(item, index) in years" :key="index">
                <v-list-tile-title @click="certify(item, certification)">{{ item }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span v-if="year"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t(certification === 'h' ? 'card.manuallyVerified' : 'card.publisherVerified') }}</a></span>
          <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </span>
</template>

<script>
export default {
  props: [ 'card' ],
  computed: {
    user () {
      return this.$store.state.user
    },
    certifications () {
      if (this.$store.state.certifications.certifications && (this.$store.state.certifications.certifications.p || this.$store.state.certifications.certifications.h)) {
        return this.$store.state.certifications.certifications
      }
      return { h: null, p: null }
    },
    years () {
      const currentYear = new Date().getFullYear()
      return [currentYear - 2, currentYear - 1, currentYear]
    }
  },
  methods: {
    certify (year, certification) {
      if (year) {
        this.certifications[certification] = year
        this.$store.dispatch('certifications/UPDATE', { cId: this.card.id, certifications: this.certifications }).then((res) => {
          this.$store.dispatch('certifications/FETCH_CERTIFICATION', this.card.id)
        })
      }
    }
  }
}
</script>

<style scoped>
.dateBtn {
  min-width: 70px;
  max-width: 70px;
  min-height: 24px;
  max-height: 24px;
  padding: 0 0 0 8px;
}
.mdash {
  min-width: 29px;
  max-width: 29px;
  min-height: 24px;
  max-height: 24px;
  padding: 0 0 0 9px;
}
.notCertified {
  opacity: 0.5;
}
.notCertified:hover {
  opacity: 1;
}
.menuDown {
  margin: 0 5px 0 0;
}
</style>