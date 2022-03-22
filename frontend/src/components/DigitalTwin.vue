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
                          @change="changeStatus(statusList[i][j], i, j, item)"
                        >
                        </v-switch>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="columns[i][j].text"
                        ></v-list-item-title>
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
                          @change="changeStatus(statusList[i][j], i, j, item)"
                        >
                        </v-switch>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="columns[i][j].text"
                        ></v-list-item-title>
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
          <v-card-title> Port switching events </v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
            <v-data-table
              dense
              :headers="headers"
              :items="portList"
              :items-per-page="5"
              class="elevation-1"
            >
            </v-data-table> </v-card-text></v-card
      ></v-col>
      <v-col md="2"> </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { TransactionUtil } from "../utils/tx";
export default {
  data() {
    return {
      items: [],
      tx: null,
      statusList: [
        [false, false, false, false],
        [false, false, false, false],
      ],
      cols: 2,
      portList: [],
      headers: [
        { text: "Creation Time", sortable: false, value: "creationTime" },
        { text: "Block No.", sortable: false, value: "blockNumber" },
        { text: "Gas used", sortable: false, value: "gasUsed" },
        { text: "Event message", value: "eventMsg" },
      ],
    };
  },
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
  async created() {
    this.tx = new TransactionUtil();
    this.tx.TYPE = "portSettingContract";
    for (let i = 1; i <= 8; i++) {
      this.items.push({ text: "Port " + i });
    }

    let ports = await this.tx.getPortList();
    for (let i = 0; i < ports.length; i++) {
      for (let j = 0; j < ports[i].length; j++) {
        this.statusList[i][j] = ports[i][j].status;
      }
    }

    this.statusList = [...this.statusList];
  },
  methods: {
    async changeStatus(status, i, j, item) {
      this.$root.$emit("showBusyIndicator", true);
      this.statusList[i][j] = status;
      let obj = {
        i: i,
        j: j,
        status: status,
        _eventMsg: "User changed " + item.text,
      };

      let receipt = await this.tx.sendTransaction(obj);
      this.$root.$emit("showBusyIndicator", false);
      this.portList = receipt;
    },
  },
};
</script>

<style scoped></style>
