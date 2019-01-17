pragma solidity >=0.4.22 <0.6.0;

contract EthBDID {
    address private controller;
    string private authorizationKey;
    string private revocationAddress; // IPFS address

    modifier onlyController() {
        require(msg.sender == controller);
        _;
    }

    constructor(address _controller, string _authorizationKey) public {
        controller = _controller;
        authorizationKey = _authorizationKey;
    }

    function setController(address _controller) public onlyController {
        controller = _controller;
    }

    function getController() view public returns (address) {
        return controller;
    }

    function setAuthorizationKey(string _authorizationKey) public onlyController {
        authorizationKey = _authorizationKey;
    }

    function getAuthorizationKey() view public returns (string) {
        return authorizationKey;
    }

    function setRevocationAddress(string memory _revocationAddress) public onlyController {
        revocationAddress = _revocationAddress;
    }

    function getRevocationAddress() public view returns (string) {
        return revocationAddress;
    }
}
