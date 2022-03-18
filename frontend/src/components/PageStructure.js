import DashboardPage from "./DashboardPage.vue";
import Invoice from "./Invoice.vue";
import DigitalTwin from "./DigitalTwin.vue";
export default {
    getPageStructure() {
        return [{
            path: "logging",
            name: "Event Logging",
            icon: "icon-dataconsumption",
            component: DashboardPage,
            subpages: []
        },
        {
            path: "invoice",
            name: "Invoice for Devices",
            icon: "icon-settings",
            component: Invoice,
            subpages: []
        },
        {
            path: "digital-twin",
            name: "Digital Twin",
            icon: "icon-dashboard",
            component: DigitalTwin,
            subpages: []
        }
        ];
    },
    getDisplayName(name) {
        let displayName = name;
        if (displayName.indexOf('(') != -1) {
            displayName = displayName.substring(0, displayName.indexOf('('));
        }
        return displayName;
    }
}