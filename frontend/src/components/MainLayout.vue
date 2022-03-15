<template>
  <v-app id="inspire">
    <v-navigation-drawer overlay-color="white" v-model="drawer" width="324" app>
      <navigation-menu />
      <v-overlay :value="blockNavigationMenu"> </v-overlay>
    </v-navigation-drawer>

    <v-app-bar app height="80">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="main-title">{{ uiTitle }}</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <div class="main-header">
        <v-breadcrumbs :items="breadcrumbs">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>
      <v-row no-gutters>
        <v-col cols="12" md="12">
          <router-view class="main-content"></router-view>
        </v-col>
      </v-row>
      <v-overlay :value="showBusyIndicator">
        <v-progress-circular
          indeterminate
          :size="70"
          :width="7"
          color="primary"
        ></v-progress-circular>
      </v-overlay>
    </v-main>
    <v-snackbar v-model="errorSnackbar" :timeout="-1" color="error">
      {{ errorText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="errorSnackbar = false">
          X
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import NavigationMenu from "@/components/NavigationMenu";
export default {
  components: {
    NavigationMenu,
  },
  data: () => ({
    drawer: null,
    breadcrumbs: [],
    showBusyIndicator: false,
    blockNavigationMenu: false,
    uiTitle: "Expert Power Control",
    errorSnackbar: false,
    errorText: "",
  }),
  watch: {
    $route() {
      this.$data.breadcrumbs = this.$route.meta.breadcrumb;
    },
    uiTitle: function () {
      document.title = this.$data.uiTitle;
    },
  },
  mounted: function () {
    // errorUtils.setVueRoot(this.$root);
    if (
      process.env.VUE_APP_UI_TITLE !== undefined &&
      process.env.VUE_APP_UI_TITLE != "#UI_TITLE#"
    ) {
      this.$data.uiTitle = process.env.VUE_APP_UI_TITLE;
    }
    this.$data.breadcrumbs = this.$route.meta.breadcrumb;
    this.$root.$on("showBusyIndicator", (show) => {
      this.$data.showBusyIndicator = show;
    });
    this.$root.$on("blockNavigationMenu", (block) => {
      this.$data.blockNavigationMenu = block;
    });
    this.$root.$on("error", (errorText) => {
      this.$data.errorText = errorText + " (See logs for details)";
      this.$data.errorSnackbar = true;
    });
  },
  methods: {},
};
</script>

<style>
.main-header {
  width: 100%;
  height: 50px;
}

.main-content {
  margin-left: 30px;
  margin-right: 30px;
}

.main-title {
  color: var(--v-text1-base);
}

.v-toolbar__content .v-icon {
  color: var(--v-text1-base) !important;
}
</style>
