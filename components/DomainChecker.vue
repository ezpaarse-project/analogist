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
      <v-btn type="submit" flat :loading="checking">{{ $t('domainCheck.check') }}</v-btn>
    </v-layout>

    <p v-if="checking">{{ $t('domainCheck.checking') }}</p>
    <p v-else-if="parser" v-html="$t('domainCheck.supported', { domainName, trello: parser.manifest.trello, cardName: parser.manifest.longname })"></p>
    <p v-else-if="error">{{ $t('domainCheck.error', { message: error.message }) }}</p>
    <p v-else-if="domainName" v-html="$t('domainCheck.unsupported', { domainName })"></p>
    <p v-else>{{ $t('domainCheck.pleaseType') }}</p>
  </form>
</template>

<script>
export default {
  data () {
    return {
      domainName: '',
      domainInput: '',
      checking: false,
      parser: null,
      error: null
    }
  },
  methods: {
    async checkDomain (domain) {
      if (!domain) { return }

      this.checking = true
      this.domainName = domain
      this.parser = null
      this.error = null

      try {
        const res = await this.$store.dispatch('CHECK_DOMAIN', this.domainName)
        this.parser = res
      } catch (e) {
        this.error = e
      }

      this.checking = false
    }
  }
}
</script>
