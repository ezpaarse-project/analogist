<template>
  <form @submit.prevent="checkDomain(domainInput)">
    <v-layout row wrap>
      <v-flex>
        <v-text-field
          solo
          name="domain"
          :label="$t('domainCheck.domainName')"
          v-model="domainInput"
          autocomplete="off"
        />
      </v-flex>
      <v-btn type="submit" text :loading="checking" class="mt-2 ml-5 body-2">{{ $t('domainCheck.check') }}</v-btn>
    </v-layout>

    <p v-if="checking">{{ $t('domainCheck.checking') }}</p>
    <template v-else-if="parsers && parsers.length > 0">
      <p v-for="parser in parsers" :key="parser.platform" v-html="$t('domainCheck.supported', { domainName, trello: parser.manifest.trello, cardName: parser.manifest.longname })"></p>
    </template>
    <p class="body-2" v-else-if="error">{{ $t('domainCheck.error', { message: error.message }) }}</p>
    <p class="body-2" v-else-if="domainName" v-html="$t('domainCheck.unsupported', { domainName })"></p>
    <p class="body-2 " v-else>{{ $t('domainCheck.pleaseType') }}</p>
  </form>
</template>

<script>
export default {
  data () {
    return {
      domainName: '',
      domainInput: '',
      checking: false,
      parsers: null,
      error: null
    }
  },
  methods: {
    async checkDomain (domain) {
      if (!domain) { return }

      this.checking = true
      this.domainName = domain
      this.parsers = null
      this.error = null

      try {
        const res = await this.$store.dispatch('CHECK_DOMAIN', this.domainName)
        this.parsers = res
      } catch (e) {
        this.error = e
      }

      this.checking = false
    }
  }
}
</script>
