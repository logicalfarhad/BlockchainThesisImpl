<template>
  <v-list class="navigation-menu">
    <div class="navigation-menu-header">
      <img src="@/assets/fraunhofer_logo_schwarz.png" class="fraunhofer-logo" />
    </div>
    <template v-for="item in items">
      <v-list-item
        v-if="!item.subitems"
        v-bind:class="{ activeitem: isActive(item) }"
        :key="item.title"
        :to="item.to"
      >
        <v-list-item-icon :class="item.icon">
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-group
        v-if="item.subitems"
        v-model="item.active"
        :key="item.title"
        no-action
      >
        <template v-slot:activator>
          <v-list-item-icon :class="item.icon">
            <!-- <img :src="item.icon" alt=""></img> -->
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="child in item.subitems"
          v-bind:class="{ activeitem: isActive(child) }"
          :key="child.title"
          :to="child.to"
        >
          <v-list-item-content>
            <v-list-item-title v-text="child.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </template>
  </v-list>
</template>

<script>
import PageStructure from "./PageStructure";
export default {
  props: [],
  name: "navigation-menu",
  data() {
    return {
      items: this.getItems(),
      activeRoute: null,
    };
  },
  mounted: function () {
    this.$data.activeRoute = this.$route;
  },
  watch: {
    $route() {
      this.$data.activeRoute = this.$route;
    },
  },
  methods: {
    getItems() {
      var items = [];
      for (let page of PageStructure.getPageStructure()) {
        if (page.showInMenu === undefined || page.showInMenu == true) {
          let subitems = undefined;
          if (page.subpages !== undefined && page.subpages.length > 0) {
            subitems = [];
            for (let subpage of page.subpages) {
              if (
                subpage.showInMenu === undefined ||
                subpage.showInMenu == true
              ) {
                subitems.push({
                  icon: subpage.icon,
                  title: PageStructure.getDisplayName(subpage.name),
                  to: subpage.path,
                });
              }
            }
            if (subitems.length == 0) {
              subitems = undefined;
            }
          }

          items.push({
            icon: page.icon,
            title: page.name,
            to: page.path,
            subitems: subitems,
          });
        }
      }
      return items;
    },
    isActive(item) {
      let active = false;
      if (this.$data.activeRoute != null) {
        if (
          item.to != null &&
          item.to.replace("/", "") ==
            this.$data.activeRoute.path.replace("/", "")
        ) {
          active = true;
        } else if (
          this.$data.activeRoute.meta.parent != null &&
          item.to != null &&
          this.$data.activeRoute.meta.parent.path != null &&
          item.to.replace("/", "") ==
            this.$data.activeRoute.meta.parent.path.replace("/", "")
        ) {
          active = true;
        }
      }
      return active;
    },
  },
};
</script>

<style>
.v-navigation-drawer {
  background-color: var(--v-primary-base) !important;
}

.navigation-menu {
  padding-top: 0px;
}

.navigation-menu-header {
  height: 80px;
  background-color: var(--v-text4-base);
  margin-bottom: 40px;
}

.fraunhofer-logo {
  margin-left: 58px;
  margin-top: 21px;
}

.navigation-menu .v-list-item__title {
  font-size: 19px;
}

.navigation-menu .activeitem {
  background-color: var(--v-primaryhighlight-base);
}

.navigation-menu .activeitem .v-list-item__title {
  color: var(--v-accent-base) !important;
}

.navigation-menu .v-icon {
  color: white !important;
}

.v-list-item__icon {
  font-family: "icons";
  font-size: 30px;
  color: white;
}

.navigation-menu .activeitem .v-list-item__icon {
  color: var(--v-accent-base) !important;
}

.navigation-menu .v-list-group__items {
  margin-left: 7px;
}

.navigation-menu .v-list-item__title {
  color: var(--v-lighttext-base) !important;
}

.navigation-menu .v-list-item:hover {
  background-color: var(--v-primaryhighlight2-base);
}

.navigation-menu .v-list-group__items .v-list-item__title {
  font-size: 16px;
  color: var(--v-textgrey-base);
}

.navigation-menu .v-list-item--link:before {
  background-color: rgba(0, 0, 0, 0) !important;
}
</style>
