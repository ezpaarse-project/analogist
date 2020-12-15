<template>
  <v-card>
    <v-card-title primary-title>
      <div>
        <h3 class="headline mb-0">
          {{ $t('badges.shareOnLinkedIn') }}
        </h3>
      </div>
    </v-card-title>

    <v-card-text class="linkedInbtn">
      <v-tabs
        v-model="activeTab"
        show-arrows
        grow
        dark
      >
        <v-tab href="#tab-share">
          {{ $t('badges.share') }}
        </v-tab>
        <v-tab href="#tab-certification">
          {{ $t('badges.shareCertification') }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="activeTab">
        <v-tab-item
          id="tab-share"
          class="text-sm-center"
        >
          <p class="mt-3">
            <i>{{ $t('badges.shareInYourNetwork') }}</i>
          </p>
          <a
            :href="`https://www.linkedin.com/shareArticle?mini=true&url=${validationUrl}&source=AnalogIST`"
            target="_blank"
            rel="noreferrer"
          >
            <p><v-btn
              color="blue"
              class="white--text"
            >{{ $t('badges.share') }}</v-btn></p>
          </a>
        </v-tab-item>

        <v-tab-item
          id="tab-certification"
          class="text-sm-center"
        >
          <p class="mt-3">
            <i>{{ $t('badges.addCertification') }}</i>
          </p>
          <a
            href="https://www.linkedin.com/profile/add/?startTask=CERTIFICATION_NAME"
            target="_blank"
            rel="noreferrer"
          >
            <p><v-btn
              color="blue"
              class="white--text"
            >{{ $t('badges.shareCertification') }}</v-btn></p>
          </a>
          <div>
            <h4>{{ $t('badges.copyPast') }}</h4>
            <v-form>
              <v-container>
                <v-text-field
                  readonly
                  :value="badge.name"
                  :label="$t('badges.certificationName')"
                />
                <v-text-field
                  readonly
                  value="AnalogIST"
                  :label="$t('badges.certificationAuthority')"
                />
                <v-text-field
                  readonly
                  :value="badge.licence"
                  :label="$t('badges.licenseNumber')"
                />
                <v-text-field
                  readonly
                  :value="issued_on"
                  :label="$t('badges.timeRangeStart')"
                />
                <span v-if="badge.expires_on">
                  <v-text-field
                    readonly
                    :value="expires_on"
                    :label="$t('badges.timeRangeEnd')"
                  />
                </span>
                <span v-else>{{ $t('badges.thisCertificationDoesNotExpire') }}</span>
                <v-text-field
                  readonly
                  :value="validationUrl"
                  :label="$t('badges.certificationURL')"
                  class="mt-4"
                />
              </v-container>
            </v-form>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="red"
        text
        @click="closeLinkedInCard"
      >
        {{ $t('ezLogger.close') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    badge: {
      type: Object,
      default: () => ({}),
    },
    userId: {
      type: String,
      default: () => (''),
    },
  },
  data() {
    return {
      activeTab: 'tab-share',
    };
  },
  computed: {
    issued_on() {
      return this.$dateFns.format(new Date(this.badge.issued_on * 1000), 'L / yyyy', { locale: this.$i18n.locale });
    },
    expires_on() {
      return this.$dateFns.format(new Date(this.badge.expires_on * 1000), 'L / yyyy', { locale: this.$i18n.locale });
    },
    validationUrl() {
      // eslint-disable-next-line no-restricted-globals
      return `http://${location.host}/api/badges/view/${this.userId}/${this.badge.id}/${this.$i18n.locale}`;
    },
  },
  methods: {
    closeLinkedInCard() {
      this.$emit('closeLinkedInCard');
    },
  },
};
</script>

<style scoped>
.linkedInbtn a {
  text-decoration: none;
  color: rgba(0, 0, 0, .87);
}
</style>
