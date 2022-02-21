<template>
  <v-container>
    <v-row class="mb-9">
      <v-col cols="4">
        <v-card class="info-box" elevation="3" tile>
          <v-card-title>Choose date range</v-card-title>
          <v-card-text>
            <v-flex xs8>
              <v-datetime-picker
                v-model="datetime"
                :text-field-props="textFieldProps"
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
                v-model="datetime"
                :text-field-props="textFieldProps"
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
            <v-btn color="primary lighten-1">CLEAR</v-btn>
            <v-btn color="primary darken-1">Verify</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-card class="info-box" elevation="3" tile>
          <v-card-title>{{ title }}</v-card-title>
          <v-card-text>
            <v-card-text>
              The dashboard shows the event logs based on selected date and time.
            </v-card-text>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  components: {
  },
  data() {
    return {
      title: "Event Logging Dashboard",
      datetime: null,
      textFieldProps: {
        prependIcon: "event",
        dense: true,
        filled: true,
        placeholder: "Please select start date",
      },
      dateProps: {
        min: null,
        max: new Date().toISOString(),
      },
      timeProps: {
        useSeconds: true,
        smAndUp: true,
        scrollable: true,
      },
    };
  }
};
</script>
