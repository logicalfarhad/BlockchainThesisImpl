<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col md="4"> </v-col>
      <v-col md="4">
        <v-card>
          <v-card-title>Switch board </v-card-title>
          <v-card-text>
            <v-row v-for="(column, i) in columns" :key="i">
              <fragment v-for="(item, j) in column" :key="j">
                <v-col md="6" v-if="i == 0">
                  <v-list flat>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-switch
                          inset
                          v-model="statusList[i][j]"
                          @change="getStatus(statusList[i][j], i, j, item)"
                        >
                        </v-switch>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title v-text="columns[i][j].text"></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col md="6" v-else-if="i == 1">
                  <v-list flat>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-switch
                          inset
                          v-model="statusList[i][j]"
                          @change="getStatus(statusList[i][j], i, j, item)"
                        >
                        </v-switch>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title v-text="columns[i][j].text"></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-col>
              </fragment>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="4"></v-col>
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
    statusList: [
      [false, false, false, false],
      [false, false, false, false],
    ],
    cols: 2,
  }),

  computed: {
    columns() {
      let columns = [];
      let mid = Math.ceil(this.items.length / this.cols);
      for (let col = 0; col < this.cols; col++) {
        columns.push(this.items.slice(col * mid, col * mid + mid));
      }
      return columns;
    },
  },
  created() {
    for (let i = 1; i <= 8; i++) {
      this.items.push({ text: "Port " + i });
    }
  },
  methods: {
    getStatus(status, i, j, item) {
      console.log(item.text);
      this.statusList[i][j] = status;
    },
  },
};
</script>

<style scoped></style>
