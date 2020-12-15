<template>
  <v-list-item
    v-if="!card.closed || displayAllCards"
    ripple
    router
    :to="{ name: 'platforms-cid', params: { cid: card.id }}"
  >
    <v-list-item-content>
      <v-list-item-title>
        <v-tooltip
          v-if="card.closed"
          right
        >
          <template v-slot:activator="{ on }">
            <span v-on="on">
              <v-icon
                size="24"
                class="mb-1"
              >mdi-archive</v-icon>
              {{ card.name }}
            </span>
          </template>
          <span v-text="$t('card.archived')" />
        </v-tooltip>
        <span
          v-else
          v-text="card.name"
        />
      </v-list-item-title>
      <v-list-item-subtitle>{{ listName }}</v-list-item-subtitle>
      <v-list-item-subtitle>{{ $t('card.nbAnalyses', { n: nbAnalyses }) }}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-list-item-subtitle class="caption">
        {{ updatedAt }}
      </v-list-item-subtitle>
      <span>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-list-item-avatar
              v-if="humanCertified"
              class="cert-icon"
              size="24"
              color="#F4B48B"
              v-on="on"
            >
              <span class="white--text">H</span>
            </v-list-item-avatar>
          </template>
          <span v-text="$t('certifications.humanCert')" />
        </v-tooltip>
      </span>
      <span>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-list-item-avatar
              v-if="publisherCertified"
              class="cert-icon"
              size="24"
              color="#5AB9C1"
              v-on="on"
            >
              <span class="white--text">P</span>
            </v-list-item-avatar>
          </template>
          <span v-text="$t('certifications.publisherCert')" />
        </v-tooltip>
      </span>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  props: {
    card: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    displayAllCards() {
      return this.$store.state.displayAllCards;
    },
    updatedAt() {
      return this.$dateFns.formatDistanceToNow(new Date(this.card.lastActivity));
    },
    nbAnalyses() {
      try {
        return this.platform.analyses;
      } catch (e) {
        return 0;
      }
    },
    listName() {
      return this.list && this.list.name;
    },
    list() {
      return this.$store.state.trelloLists.find((l) => this.card.idList === l.id);
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
    publisherCertifications() {
      return this.platform.publisherCertifications;
    },
    publisherCertified() {
      if (this.platform && this.publisherCertifications.length > 0) {
        if (this.publisherCertifications[0].form.year) {
          return true;
        }
        return false;
      }
      return false;
    },
  },
};
</script>
