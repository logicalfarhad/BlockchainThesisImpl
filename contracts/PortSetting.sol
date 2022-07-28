// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract PortSetting {
    event portEvent(string eventMsg);

    struct Port {
        bool status;
        string eventMsg;
    }
    Port[4][2] portList;

    constructor() {
        portList[0][0] = Port(false, "Port 1");
        portList[0][1] = Port(false, "Port 2");
        portList[0][2] = Port(false, "Port 3");
        portList[0][3] = Port(false, "Port 4");
        portList[1][0] = Port(false, "Port 5");
        portList[1][1] = Port(false, "Port 6");
        portList[1][2] = Port(false, "Port 7");
        portList[1][3] = Port(false, "Port 8");
    }

    function changePortState(
        uint256 i,
        uint256 j,
        bool status,
        string memory _eventMsg
    ) public {
        emit portEvent(_eventMsg);
        portList[i][j] = Port(status, _eventMsg);
    }

    function getPortById(uint256 i, uint256 j)
        public
        view
        returns (Port memory)
    {
        return portList[i][j];
    }

    function getPortList() public view returns (Port[4][2] memory _portList) {
        return portList;
    }
}
