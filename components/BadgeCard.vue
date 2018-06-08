<template>
  <v-card>
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs5>
          <v-card-media :src="badge.image" height="100%" contain></v-card-media>
        </v-flex>
        <v-flex xs7>
          <div>
            <p class="headline">{{ badge.name }}</p>
            
            <p>{{ badge.description }}</p>
            <p v-if="badge.issued_on">{{ $t('badges.issuedOn') }} : {{ issued_on }}</p>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-actions>
      <v-btn color="red" flat @click.stop="closeCard">{{ $t('ezLogger.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'

export default {
  props: ['badge'],
  computed: {
    issued_on () {
      return this.badge.issued_on ? moment.unix(this.badge.issued_on).locale(this.$i18n.locale).format('LL') : null
    }
  },
  methods: {
    closeCard () {
      this.$emit('closeCard')
    }
  }
}
</script>
