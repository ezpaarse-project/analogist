<template>
  <form @submit.prevent="checkDomain(domainInput)">
    <v-layout column>
      <v-flex>
        <v-text-field hide-details name="domain" :label="$t('domainCheck.domainName')" v-model="domainInput" autocomplete="off"></v-text-field>
        <v-btn type="submit" flat :loading="checking">{{ $t('domainCheck.check') }}</v-btn>
      </v-flex>
      <v-flex>
        <p v-if="checking">{{ $t('domainCheck.checking') }}</p>
        <p v-else-if="parser" v-html="$t('domainCheck.supported', { domainName, trello: parser.manifest.trello, cardName: parser.manifest.longname })"></p>
        <p v-else-if="error">{{ $t('domainCheck.error', { message: error.message }) }}</p>
        <p v-else-if="domainName" v-html="$t('domainCheck.unsupported', { domainName })"></p>
        <p v-else>{{ $t('domainCheck.pleaseType') }}</p>
      </v-flex>
    </v-layout>
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

<style scoped>
  .align-center {
    align-items: center
  }
</style>