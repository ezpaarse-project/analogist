<template>
  <v-list-item>
    <v-list-item-avatar color="#F4B48B">
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
              color="#F4B48B"
              depressed
              :disabled="!user || !canCertify"
              v-on="on"
            >
              <span v-if="humanCertified">{{ year || '-' }}</span>
              <span v-else>-</span>
            </v-btn>
          </template>
          <v-list v-if="user">
            <v-list-item
              v-for="(item, index) in years"
              :key="index"
            >
              <v-list-item-title
                class="pointer text-center"
                @click="openDialog(item)"
              >
                {{ item || '-' }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <span v-if="humanCertified"> - <a
          href="https://blog.ezpaarse.org/2017/06/certification-h-et-p-des-plateformes-traitees-dans-ezpaarse/"
          target="_blank"
          rel="noreferrer"
        >{{ $t('card.manuallyVerified') }}</a></span>
        <span v-else> - <a
          href="https://blog.ezpaarse.org/2020/01/tutoriels-procedure-de-certification-h-et-p-dans-analogist"
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
      default: () => ([]),
    },
  },
  data() {
    return {
      name: 'H',
    };
  },
  computed: {
    card() {
      return this.$store.state.card;
    },
    user() {
      return this.$store.state.user;
    },
    platform() {
      return this.card && this.card.platform;
    },
    humanCertifications() {
      return this.platform.humanCertifications;
    },
    humanCertified() {
      if (this.platform && this.humanCertifications.length > 0) {
        if (this.humanCertifications[0].form.year) {
          return true;
        }
        return false;
      }
      return false;
    },
    year() {
      return this.humanCertified ? this.humanCertifications[0].form.year : null;
    },
    canCertify() {
      let isUpdated = false;
      const list = this.$store.state.trelloLists.find((l) => this.card.idList === l.id);
      if (list) {
        let match;
        if ((match = /^([0-9]+)/i.exec(list.name)) !== null) {
          isUpdated = Number.parseInt(match[1], 10) === 10;
        }
      }
      return this.platform
        && this.platform.analyses
        && this.platform.analyses.length > 0 && isUpdated;
    },
  },
  methods: {
    openDialog(year) {
      this.$emit('openDialog', true, false, year);
    },
  },
};
</script>
