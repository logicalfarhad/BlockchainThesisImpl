<template>
  <v-container>
    <v-row class="mb-9">
      <v-col cols="4">
        <v-card class="info-box" elevation="3" tile>
          <v-card-title>Choose date range</v-card-title>
          <v-card-text>
            <v-flex xs8>
              <v-datetime-picker
                v-model="startDate"
                :text-field-props="textFieldProps1"
                :date-picker-props="dateProps"
                :time-picker-props="timeProps"
                time-format="HH:mm:ss"
              >
                <template slot="actions" slot-scope="{ parent }">
                  <v-btn
                    color="primary lighten-1"
                    @click.native="parent.clearHandler"
                    >CLEAR</v-btn
                  >
                  <v-btn color="primary darken-1" @click="parent.okHandler"
                    >OK</v-btn
                  >
                </template>
              </v-datetime-picker>
            </v-flex>
            <v-flex xs8>
              <v-datetime-picker
                v-model="endDate"
                :text-field-props="textFieldProps2"
                :date-picker-props="dateProps"
                :time-picker-props="timeProps"
                time-format="HH:mm:ss"
                allowed-dates="allowedDates"
              >
                <template slot="actions" slot-scope="{ parent }">
                  <v-btn
                    color="primary lighten-1"
                    @click.native="parent.clearHandler"
                    >CLEAR</v-btn
                  >
                  <v-btn color="primary darken-1" @click="parent.okHandler"
                    >OK</v-btn
                  >
                </template>
              </v-datetime-picker>
            </v-flex>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary lighten-1" @click="clear">CLEAR</v-btn>
            <v-btn color="primary darken-1" @click="verify">Verify</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-card class="info-box" elevation="3" tile>
          <v-card-title>{{ title }}</v-card-title>
          <v-card-text>
            <v-card-text>
              The dashboard shows the event logs based on selected date and
              time.
            </v-card-text>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      title: "Event Logging Dashboard",
      startDate: null,
      endDate: null,
      textFieldProps1: {
        prependIcon: "event",
        dense: true,
        filled: true,
        placeholder: "Please select start date",
      },
      textFieldProps2: {
        prependIcon: "event",
        dense: true,
        filled: true,
        placeholder: "Please select end date",
      },
      dateProps: {
        min: null,
        max: null,
      },
      timeProps: {
        useSeconds: true,
        smAndUp: true,
        scrollable: true,
      },
    };
  },
  methods: {
    async verify() {
      this.$root.$emit("showBusyIndicator", true);
      const response = await fetch(
        "http://localhost:5000/getLogsfromBlockchain"
      );
      const data = await response.json();
      console.log(data);

      console.log("--------------------------------");
      const dbresponse = await fetch("http://localhost:5000/getLogsfromDb");
      const dbdata = await dbresponse.json();
      console.log(dbdata);
      this.$root.$emit("showBusyIndicator", false);
    },
    clear() {
      
    },
  },
  created() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateProps.max = tomorrow.toISOString();
  },
};
</script>
