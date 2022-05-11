// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract EnergyPrice {
    string price = "0.3216";
    event priceChanged(string oldprice, string newprice);

    function setCost(string memory _price) public {
        emit priceChanged(price, _price);
        price = _price;
    }

    function getPrice() public view returns (string memory) {
        return price;
    }
}
