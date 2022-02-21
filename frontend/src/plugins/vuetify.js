import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import light from './default'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        options: {
            customProperties: true
        },
        themes: {
            light
        },
    }
});
