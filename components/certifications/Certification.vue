<template>
  <span>
    <Human v-bind:years="years" v-on:openDialog="openDialog" />
    <Publisher v-bind:years="years" v-on:openDialog="openDialog" />

    <v-dialog
      v-model="dialog"
      @click:outside="closeDialog"
      @keydown.esc="closeDialog"
      width="600"
    >
       <v-card>
        <v-card-title
          dark
          class="headline"
          primary-title
        >
          Certification {{ certification }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            enctype="multipart/form-data"
          >
            <v-layout  wrap class="my-2">
              <v-flex xs12 sm12>
                <v-select
                  v-model="form.object"
                  :rules="[v => !!v || $t('certifications.formError.object')]"
                  :items="objects"
                  item-text="value"
                  item-value="name"
                  :label="$t('certifications.form.object')"
                  :disabled="disableObject"
                  required
                ></v-select>
              </v-flex>

              <v-flex xs12 sm12>
                <v-text-field
                  v-model="form.establishment"
                  :rules="[v => !!v || $t('certifications.formError.establishment')]"
                  required
                  placeholder="ex: CNRS"
                  :label="$t('certifications.form.establishment')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12 sm12>
                <v-textarea
                  name="input-7-1"
                  :label="$t('certifications.form.comment')"
                  v-model="form.comment"
                  :rules="[v => !!v || $t('certifications.formError.comment')]"
                  required
                ></v-textarea>
              </v-flex>

              <v-flex xs12 sm6 pr-1 v-if="certification === 'P'">
                <v-text-field
                  v-model="form.values.ezpaarse"
                  type="number"
                  placeholder="ex: 9092"
                  :label="$t('certifications.form.totalEzpaarse')"
                  :rules="[v => !!v || $t('certifications.formError.totalValue')]"
                ></v-text-field>
              </v-flex>

              <v-flex xs12 sm6 pl-1 v-if="certification === 'P'">
                <v-text-field
                  v-model="form.values.editor"
                  type="number"
                  placeholder="ex: 9571"
                  :label="$t('certifications.form.totalEditor')"
                  :rules="[v => !!v || $t('certifications.formError.totalValue')]"
                  required
                ></v-text-field>
              </v-flex>
              
              <v-flex xs12 sm12>
                <v-file-input
                  ref="attachement"
                  id="attachement"
                  name="attachement"
                  show-size
                  v-model="form.attachement"
                  :label="$t('certifications.form.attachement')"
                  :rules="[v => !!v || (v && v.size < 2000000) || $t('certifications.formError.attachement')]"
                  :hint="$t('certifications.form.attachementSize')"
                  persistent-hint
                ></v-file-input>
              </v-flex>

              <v-flex xs12 sm12 mt-3>
                <p class="caption" v-text="$t('certifications.form.requiredFields')"></p>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="certify()" :disabled="!valid">{{ $t('certifications.send') }}</v-btn>
          <v-btn text @click="closeDialog">{{ $t('certifications.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import Human from '~/components/certifications/Human'
import Publisher from '~/components/certifications/Publisher'

export default {
  components: {
    Human,
    Publisher
  },
  data () {
    return {
      dialog: false,
      valid: true,
      form: {
        object: null,
        establishment: null,
        comment: null,
        attachement: [],
        values: {
          ezpaarse: null,
          editor: null
        }
      },
      disableObject: false,
      certification: null,
      year: null
    }
  },
  computed: {
    years () {
      const currentYear = new Date().getFullYear()
      return ['—', currentYear - 2, currentYear - 1, currentYear]
    },
    card () {
      return this.$store.state.card
    },
    user () {
      return this.$store.state.user
    },
    certified () {
      return this.card.platform && this.card.platform.certifications
    },
    humanCertified () {
      return this.certified ? this.card.platform.certifications.humanCertified : null
    },
    humanCertification () {
      return this.card.platform.certifications.humanCertified
    },
    publisherCertified () {
      return this.certified ? this.card.platform.certifications.publisherCertified : null
    },
    publisherCertification () {
      return this.card.platform.certifications.publisherCertified
    },
    objects () {
      return [
        { name: 'addOrModify', value: this.$t('certifications.form.objects.addOrModify') },
        { name: 'delete', value: this.$t('certifications.form.objects.delete') },
        { name: 'approved', value: this.$t('certifications.form.objects.approved') }
      ]
    }
  },
  methods: {
    closeDialog () {
      this.dialog = false
      this.valid = false
      this.year = null
      this.disableObject = false
      this.$refs.form.reset()
    },
    openDialog (certification, year) {
      this.dialog = true
      this.certification = certification

      this.year = year
      if (year === this.years[0]) {
        this.disableObject = true
        this.form.object = this.objects[1].name
        return year
      }

      this.disableObject = true
      this.form.object = this.objects[0].name
    },
    certify () {
      if (!this.$refs.form.validate()) {
        this.valid = false
        return false
      }

      if (!this.year) {
        return this.$store.dispatch('snacks/error', 'certifications.formError.date')
      }

      const formData = new FormData()
      formData.append('attachement', this.form.attachement)

      this.form.attachement = this.form.attachement.name

      const request = {
        cardName: this.card.name,
        cardId: this.card.id,
        user: {
          userId: this.user.id,
          email: this.user.email,
          fullName: this.user.fullName
        },
        form: { ...this.form, year: this.year },
        certification: this.certification
      }
      formData.append('request', JSON.stringify(request))

      this.$store.dispatch('certifications/SEND_REQUEST', { cardId: this.card.id, formData })
        .then((res) => {
          this.$store.dispatch('snacks/success', 'certifications.notification')
          this.$store.dispatch('certifications/GET_CERTIFICATIONS_EVENTS').catch((err) => {
            if (err) {
              this.$store.dispatch('snacks/error', 'errorGeneric')
            }
          })
        })
        .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))

      this.closeDialog()
    }
  }
}
</script>

