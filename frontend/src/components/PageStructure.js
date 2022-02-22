import DashboardPage from "./DashboardPage.vue";
import HelloWorld from "./HelloWorld.vue";
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
            component: HelloWorld,
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