<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
  components: {},
  data: () => ({ drawer: null }),
};
</script>
<style>
@font-face {
  font-family: "Roboto";
  src: local("Roboto"),
    url('./assets/Roboto-Regular.ttf') format("truetype");
}
@font-face {
  font-family: "icons";
  src: local("icons"), url('./assets/icons.ttf') format("truetype");
}
.icon-dashboard:before {
  content: "\e900";
}
.icon-dataoffering:before {
  content: "\e901";
}
.icon-dataconsumption:before {
  content: "\e902";
}
.icon-brokers:before {
  content: "\e903";
}
.icon-apps:before {
  content: "\e904";
}
.icon-settings:before {
  content: "\e905";
}
.v-application {
  font-family: Roboto !important;
  color: var(--v-text1-base) !important;
}
.v-application a {
  color: var(--v-text1-base) !important;
}
.v-application .primary--text {
  color: var(--v-text1-base) !important;
  caret-color: var(--v-text1-base) !important;
}
.primary--text {
  color: var(--v-text1-base) !important;
  caret-color: var(--v-text1-base) !important;
}
.v-card {
  color: var(--v-primary-base) !important;
}
.theme--light.v-card > .v-card__text,
.theme--light.v-card .v-card__subtitle {
  color: var(--v-text1-base) !important;
}
.v-label {
  color: var(--v-text1-base) !important;
}
.v-picker .v-btn__content {
  color: var(--v-text1-base) !important;
}
.v-btn__content {
  color: var(--v-lighttext-base) !important;
}
.v-data-table span {
  color: var(--v-text1-base) !important;
}
.v-data-footer {
  color: var(--v-text1-base) !important;
}
.v-select__selection--comma {
  color: var(--v-text1-base) !important;
}
.v-list-item__title {
  color: var(--v-text1-base) !important;
}
</style>
