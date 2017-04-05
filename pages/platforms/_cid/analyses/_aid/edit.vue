<template>
  <v-container v-if="analysis">
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid-analyses-aid', params: { cid: card.id, aid: analysis.id } }"><v-icon>arrow_back</v-icon></v-btn>
      <v-btn class="blue" v-on:click.native="save"><v-icon>save</v-icon></v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-card-text>
        <v-container fluid>
          <v-text-field name="title" label="Titre" v-model="analysis.title"></v-text-field>
          <v-text-field name="url" label="URL" v-model="analysis.url"></v-text-field>

          <v-row>
            <v-col xs12 sm6 md4>
              <v-text-field name="rtype" label="Type" v-model="analysis.rtype"></v-text-field>
            </v-col>
            <v-col xs12 sm6 md4>
              <v-text-field name="mime" label="Format" v-model="analysis.mime"></v-text-field>
            </v-col>
            <v-col xs12 sm12 md4>
              <v-text-field name="unitid" label="UnitID" v-model="analysis.unitid"></v-text-field>
            </v-col>
          </v-row>

          <v-text-field multi-line name="comment" label="Remarques" v-model="analysis.comment"></v-text-field>

          <h4>Champs reconnus</h4>
          <v-row v-for="(id, index) in analysis.identifiers" :key="index">
            <v-col xs12 sm6>
              <v-text-field label="Type" v-model="id.type"></v-text-field>
            </v-col>
            <v-col xs12 sm6>
              <v-text-field label="Valeur" v-model="id.value"></v-text-field>
            </v-col>
          </v-row>

          <h4>Éléments de la route</h4>
          <v-row v-for="(id, index) in analysis.pathParams" :key="index">
            <v-col xs12 sm6>
              <v-text-field label="Valeur" v-model="id.value"></v-text-field>
            </v-col>
            <v-col xs12 sm6>
              <v-text-field label="Commentaire" v-model="id.comment"></v-text-field>
            </v-col>
          </v-row>

          <h4>Paramètres de la query</h4>
          <v-row v-for="(id, index) in analysis.queryParams" :key="index">
            <v-col xs12 sm6 md3>
              <v-text-field label="Nom" v-model="id.name"></v-text-field>
            </v-col>
            <v-col xs12 sm6 md4>
              <v-text-field label="Valeur" v-model="id.value"></v-text-field>
            </v-col>
            <v-col xs12 sm12 md5>
              <v-text-field label="Commentaire" v-model="id.comment"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>

  <v-container v-else>
    <v-row>
      <v-btn class="blue-grey" router :href="{ name: 'platforms-cid-analyses', params: { cid: card.id } }"><v-icon>arrow_back</v-icon></v-btn>
    </v-row>

    <v-card>
      <v-card-row class="blue-grey white--text">
        <v-card-title>
          {{ card.name }}
        </v-card-title>
      </v-card-row>

      <v-card-text>
        Analyse introuvable
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'analysis-edit',
  async fetch ({ params, store, error, redirect }) {
    if (!store.state.user || !store.state.user.isAuthorized) {
      return redirect(`/platforms/${params.cid}/analyses/${params.aid}`);
    }

    try {
      await store.dispatch('FETCH_CARD', params.cid)
    } catch (e) {
      const statusCode = e.response && e.response.status
      const message    = e.response && e.response.statusText

      return error({ statusCode, message: statusCode === 404 ? 'Carte introuvable' : message })
    }

    store.dispatch('GET_ANALYSIS', params.aid)
  },
  head () {
    return {
      title: `Analyses: ${this.card.name}`
    }
  },
  computed: {
    card () {
      return this.$store.state.card
    },
    analysis () {
      return this.$store.state.analysis
    },
    canSave() {
      return this.$store.state.user && this.$store.state.user.isAuthorized
    }
  },
  methods: {
    save () {
      console.log('SAVING', this.analysis)
    }
  }
}
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }
</style>