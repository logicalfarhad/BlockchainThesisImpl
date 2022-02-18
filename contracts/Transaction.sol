// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract Transaction {
    struct Log {
        string hashValue;
        uint256 timestamp;
    }
    mapping(uint256 => Log) logList;

    Log[] logs;

    uint256 public logCount;

    constructor() {
        logCount = 0;
    }

    function addLog(string memory _hashVal, uint256 _timestamp) public {
        logs.push(Log(_hashVal, _timestamp));
        logList[logCount] = Log(_hashVal, _timestamp);
        logCount++;
    }

    function getLogbyId(uint256 _logId) public view returns (Log memory) {
        return logList[_logId];
    }
}
