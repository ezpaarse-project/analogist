// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import en from 'vuetify/lib/locale/en';
import fr from 'vuetify/lib/locale/fr';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import colors from 'vuetify/es5/util/colors';

Vue.use(Vuetify);

export default (ctx) => {
  const { locale } = ctx.app.i18n;

  const vuetify = new Vuetify({
    lang: {
      locales: { fr, en },
      current: locale,
    },
    font: {
      family: 'Roboto',
    },
    icons: {
      iconfont: 'mdi',
    },
    theme: {
      themes: {
        dark: {
          primary: colors.red.accent3,
        },
        light: {
          primary: colors.red.accent3,
        },
      },
    },
  });

  ctx.app.vuetify = vuetify;
  ctx.$vuetify = vuetify.framework;
};
