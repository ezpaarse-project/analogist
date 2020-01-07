<template>
  <span>
    <v-list-tile v-if="card.certifications" :class="!card.certifications.h ? 'notCertified' : ''" avatar>
      <v-list-tile-avatar color="#F4B48B">
        <span class="white--text headline">H</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title style="height: 35px;">
          <v-chip v-if="!user" label color="#F4B48B" text-color="white">
            {{ card.certifications.h || years[0] }}
          </v-chip>
          <v-menu offset-y v-else>
            <v-btn small slot="activator" color="#F4B48B" dark depressed>
              <span style="width: 25px;">{{ card.certifications.h || years[0] }}</span>
              <v-icon dark right>mdi-menu-down</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile v-for="(item, index) in years" :key="index">
                <v-list-tile-title class="pointer" @click="certify(item, 'h')">{{ item }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span v-if="card.certifications.h"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.manuallyVerified') }}</a></span>
          <span v-else> - <a href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist" target="_blank">{{ $t('certifications.notCertified') }}</a></span>
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile v-if="card.certifications" :class="!card.certifications.p ? 'notCertified' : ''" avatar>
      <v-list-tile-avatar color="#5AB9C1">
        <span class="white--text headline">P</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title style="height: 35px;">
          <v-chip v-if="!user || (card.certifications && !card.certifications.h)" style="height: 28px;" label color="#5AB9C1" text-color="white">
            {{ card.certifications.p || years[0] }}
          </v-chip>
          <v-menu offset-y v-else>
            <v-btn small slot="activator" style="height: 28px;" color="#5AB9C1" dark depressed>
              <span style="width: 25px;">{{ card.certifications.p || years[0] }}</span>
              <v-icon dark right>mdi-menu-down</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile v-for="(item, index) in years" :key="index">
                <v-list-tile-title class="pointer" @click="certify(item, 'p')">{{ item }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span v-if="card.certifications.p"> - <a href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/" target="_blank">{{ $t('card.manuallyVerified') }}</a></span>
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
    years () {
      const currentYear = new Date().getFullYear()
      return ['—', currentYear - 2, currentYear - 1, currentYear]
    }
  },
  methods: {
    certify (year, certification) {
      if (year) {
        this.card.certifications[certification] = year === '—' ? null : year

        if (!this.card.certifications.h) {
          this.card.certifications.p = null
        }

        if (this.card.certifications.p && !this.card.certifications.h) {
          return this.$store.dispatch('snacks/error', 'certifications.publisherCertificationsError')
        }

        this.$store.dispatch('certifications/UPDATE', { cId: this.card.id, certifications: this.card.certifications }).then((res) => {
          this.$store.dispatch('FETCH_CARD', this.card.id).catch((err) => {
            if (err) {
              this.$store.dispatch('snacks/error', 'ezLoggerSettings.error_generic')
            }
          })
        }).catch((err) => {
          if (err) {
            this.$store.dispatch('snacks/error', 'ezLoggerSettings.error_generic')
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.v-chip {
  margin-left: 8px;
  min-width: 88px;
  max-width: 88px;
  display: inline-block;
  text-align: center;
  line-height: 24px;
}
.notCertified {
  opacity: 0.5;
}
.notCertified:hover {
  opacity: 1;
}
.pointer {
  text-align: center;
  cursor: pointer;
}
</style>
