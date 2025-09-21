// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IDRegistry {
    mapping(bytes32 => bool) public revoked;
    event Created(bytes32 id);
    event Revoked(bytes32 id);

    function createID(bytes32 id) public {
        require(!revoked[id], "ID exists or revoked");
        revoked[id] = false;
        emit Created(id);
    }

    function revokeID(bytes32 id) public {
        revoked[id] = true;
        emit Revoked(id);
    }

    function isRevoked(bytes32 id) public view returns (bool) {
        return revoked[id];
    }
}
