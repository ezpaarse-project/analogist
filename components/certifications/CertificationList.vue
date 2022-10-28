<template>
  <span>
    <HumanCert
      :years="years"
      @openDialog="openDialog"
    />
    <PublisherCert
      :years="years"
      @openDialog="openDialog"
    />

    <v-dialog
      v-model="dialog"
      width="600"
      @click:outside="closeDialog"
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title
          dark
          class="headline"
          primary-title
        >
          Certification
          <span v-if="certifications.humanCertified">&nbsp;H</span>
          <span v-if="certifications.publisherCertified">&nbsp;P</span>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            enctype="multipart/form-data"
          >
            <v-layout
              wrap
              class="my-2"
            >
              <v-flex
                xs12
                sm12
              >
                <v-select
                  v-model="form.object"
                  :rules="[v => !!v || $t('certifications.formError.object')]"
                  :items="objects"
                  item-text="value"
                  item-value="name"
                  :label="$t('certifications.form.object')"
                  :disabled="disableObject"
                  required
                />
              </v-flex>

              <v-flex
                xs12
                sm12
              >
                <v-text-field
                  v-model="form.establishment"
                  :rules="[v => !!v || $t('certifications.formError.establishment')]"
                  required
                  placeholder="ex: CNRS"
                  :label="$t('certifications.form.establishment')"
                />
              </v-flex>

              <v-flex
                xs12
                sm12
              >
                <v-textarea
                  v-model="form.comment"
                  name="input-7-1"
                  :label="$t('certifications.form.comment')"
                  :rules="[v => !!v || $t('certifications.formError.comment')]"
                  required
                />
              </v-flex>

              <v-flex
                v-if="certifications.publisherCertified"
                xs12
                sm6
                pr-1
              >
                <v-text-field
                  v-model="form.values.ezpaarse"
                  type="number"
                  placeholder="ex: 9092"
                  :label="$t('certifications.form.totalEzpaarse')"
                  :rules="[v => !!v || $t('certifications.formError.totalValue')]"
                />
              </v-flex>

              <v-flex
                v-if="certifications.publisherCertified"
                xs12
                sm6
                pl-1
              >
                <v-text-field
                  v-model="form.values.editor"
                  type="number"
                  placeholder="ex: 9571"
                  :label="$t('certifications.form.totalEditor')"
                  :rules="[v => !!v || $t('certifications.formError.totalValue')]"
                  required
                />
              </v-flex>

              <v-flex
                xs12
                sm12
              >
                <v-file-input
                  id="attachment"
                  ref="attachment"
                  v-model="form.attachment"
                  name="attachment"
                  show-size
                  :label="$t('certifications.form.attachment')"
                  :rules="[v => !!v || (v && v.size < 2000000) || $t('certifications.formError.attachment')]"
                  :hint="$t('certifications.form.attachmentSize')"
                  persistent-hint
                />
              </v-flex>

              <v-flex
                xs12
                sm12
                mt-3
              >
                <p
                  class="caption"
                  v-text="$t('certifications.form.requiredFields')"
                />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            :disabled="!valid"
            @click="certify()"
          >{{ $t('certifications.send') }}</v-btn>
          <v-btn
            text
            @click="closeDialog"
          >{{ $t('certifications.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import HumanCert from '~/components/certifications/HumanCert'
import PublisherCert from '~/components/certifications/PublisherCert'

export default {
  components: {
    HumanCert,
    PublisherCert
  },
  data () {
    return {
      dialog: false,
      valid: true,
      form: {
        object: null,
        establishment: null,
        comment: null,
        attachment: [],
        year: null
      },
      disableObject: false,
      certifications: {
        humanCertified: false,
        publisherCertified: false
      }
    }
  },
  computed: {
    years () {
      const currentYear = new Date().getFullYear()
      return [null, currentYear - 2, currentYear - 1, currentYear]
    },
    card () {
      return this.$store.state.card
    },
    user () {
      return this.$auth.$state.user
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
      this.form.year = null
      this.disableObject = false
      this.$refs.form.reset()
    },
    openDialog (humanCertified, publisherCertified, year) {
      this.dialog = true
      this.certifications.humanCertified = humanCertified
      this.certifications.publisherCertified = publisherCertified

      this.form.year = year

      if (publisherCertified) {
        this.form.values = {
          ezpaarse: null,
          editor: null
        }
      }

      this.disableObject = true
      this.form.object = this.objects[0].name
    },
    certify () {
      if (!this.$refs.form.validate()) {
        this.valid = false
        return false
      }

      if (!this.form.year) {
        this.form.object = 'delete'
      }

      const formData = new FormData()
      formData.append('attachment', this.form.attachment)

      this.form.attachment = this.form.attachment.name

      formData.append('cardName', this.card.name)
      formData.append('cardID', this.card.id)
      formData.append('form', JSON.stringify(this.form))
      formData.append('certifications', JSON.stringify(this.certifications))

      this.$store.dispatch('certifications/SEND_REQUEST', { cardID: this.card.id, formData })
        .then((res) => {
          if (this.user.role === 'admin') {
            this.$store.dispatch('FETCH_CARD', this.card.id).catch((err) => {
              if (err) {
                this.$store.dispatch('snacks/error', 'errorGeneric')
              }
            })
          }

          if (this.user.role !== 'admin') {
            this.$store.dispatch('snacks/success', 'certifications.notification')
          }
        })
        .catch(() => this.$store.dispatch('snacks/error', 'errorGeneric'))

      this.closeDialog()
    }
  }
}
</script>
