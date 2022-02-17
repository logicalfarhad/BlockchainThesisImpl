// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Transaction {
    struct Log{
    uint id;
    string hashVal;
    string timestamp;
    
  }
  mapping (uint => Log) internal logList;
  event savingsEvent(uint indexed _memberId);
  
  uint public logCount;
  
  constructor() {
    logCount = 0;
  }
  function addLog(string memory _hash,string memory _timestamp) public {
    logList[logCount] = Log(logCount, _hash, _timestamp);
    logCount++;
  }
  //return Single structure
  function getLogbyId(uint _logId) public view returns(Log memory) {
    return logList[_logId];
  }
}
