const EnergyPrice = artifacts.require("EnergyPrice");
module.exports = function (deployer) {
    deployer.deploy(EnergyPrice);
};