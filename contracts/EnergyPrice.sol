// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract EnergyPrice {
    string price = "32.16";
    event priceChanged(string oldValue, string newValue);

    function setCost(string memory _price) public {
        price = _price;
        emit priceChanged(price, _price);
    }

    function getPrice() public view returns (string memory) {
        return price;
    }
}
