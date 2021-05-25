<template>
  <v-list-item>
    <v-list-item-avatar color="#5AB9C1">
      <span
        class="white--text headline"
        v-text="name"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <v-menu
          open-on-hover
          offset-y
        >
          <template v-slot:activator="{ on }">
            <v-btn
              small
              class="dateLbl white--text"
              color="#5AB9C1"
              depressed
              :disabled="!user || !canCertify || !humanCertified"
              v-on="on"
            >
              <span v-if="publisherCertified">{{ year }}</span>
              <span v-else>-</span>
            </v-btn>
          </template>
          <v-list v-if="user && humanCertified">
            <v-list-item
              v-for="(item, index) in years"
              :key="index"
            >
              <v-list-item-title
                class="pointer text-center"
                @click="openDialog(item);"
              >
                {{ item || '-' }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <span v-if="publisherCertified"> - <a
          href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/"
          target="_blank"
          rel="noreferrer"
        >{{ $t('card.publisherVerified') }}</a></span>
        <span v-else> - <a
          href="https://blog.ezpaarse.org/2021/05/tutoriels-nouvelle-procedure-facile-de-certification-h-et-p-dans-analogist/"
          target="_blank"
          rel="noreferrer"
        >{{ $t('certifications.notCertified') }}</a></span>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  props: {
    years: {
      type: Array,
      default: () => ([])
    }
  },
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
      return this.$auth.$state.user
    },
    platform () {
      return this.card && this.card.platform
    },
    humanCertifications () {
      return this.platform.humanCertifications
    },
    humanCertified () {
      if (this.platform && this.humanCertifications.length > 0) {
        if (this.humanCertifications[0].form.year) {
          return true
        }
        return false
      }
      return false
    },
    publisherCertifications () {
      return this.platform.publisherCertifications
    },
    publisherCertified () {
      if (this.platform && this.publisherCertifications.length > 0) {
        if (this.publisherCertifications[0].form.year) {
          return true
        }
        return false
      }
      return false
    },
    year () {
      return this.publisherCertified ? this.publisherCertifications[0].form.year : null
    },
    canCertify () {
      let isUpdated = false
      const list = this.$store.state.trelloLists.find(l => this.card.idList === l.id)
      if (list) {
        let match
        if ((match = /^([0-9]+)/i.exec(list.name)) !== null) {
          isUpdated = Number.parseInt(match[1], 10) === 10
        }
      }
      return this.platform && this.platform.analyses && this.platform.analyses.length > 0 && isUpdated
    }
  },
  methods: {
    openDialog (year) {
      this.$emit('openDialog', false, true, year)
    }
  }
}
</script>
