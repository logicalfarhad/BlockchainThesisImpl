<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col md="4"> </v-col>
      <v-col md="4">
        <v-card>
          <v-card-title> Switch board </v-card-title>
          <v-card-text>
            <v-row>
              <v-col md="6">
                <v-list flat>
                  <v-list-item
                    v-for="(item, i) in items.slice(
                      0,
                      Math.ceil(items.length / 2)
                    )"
                    :key="i"
                  >
                    <v-list-item-icon>
                      <v-switch inset></v-switch>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title v-text="item.text"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col md="6">
                <v-list flat>
                  <v-list-item
                    v-for="(item, i) in items.slice(
                      -Math.ceil(items.length / 2)
                    )"
                    :key="i"
                  >
                    <v-list-item-icon>
                      <v-switch inset></v-switch>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title v-text="item.text"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="4"> </v-col>
    </v-row>
    <v-row>
      <v-col md="2"> </v-col>
      <v-col md="8">
        <v-card class="pa2">
          <v-card-title> This is for event logs </v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
          </v-card-text> </v-card
      ></v-col>
      <v-col md="2"> </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    items: [],
  }),

  created() {
    for (let i = 1; i <= 8; i++) {
      this.items.push({ text: "Port " + i });
    }
  },
};
</script>

<style scoped></style>
