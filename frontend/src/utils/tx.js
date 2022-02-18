module.exports = {
    sendTransaction: (payload) => {
        console.log("I am sendTransaction", payload);
    },
    getTransaction: (payload) => {
        console.log("I am getTransaction", payload);
    },

    getAllDaysInMonth: (month, year) => {
        let dates = Array.from({ length: new Date(year, month, 0).getDate() },
            (_, i) => new Date(year, month - 1, i + 1).getTime()
        )
        return dates;
    }
};
