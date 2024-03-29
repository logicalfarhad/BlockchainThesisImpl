// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract Transaction {
    struct Log {
        string hashValue;
        uint256 timeStamp;
    }
    mapping(uint256 => Log) logList;

    uint256 public logCount;

    constructor() {
        logCount = 0;
    }

    function addLog(string memory _hashVal, uint256 _timestamp) public {
        logList[logCount] = Log(_hashVal, _timestamp);
        logCount++;
    }

    function getLogbyId(uint256 _logId) public view returns (Log memory) {
        return logList[_logId];
    }
}
