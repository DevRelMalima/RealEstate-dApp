// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract RealEstate {
    struct Property {
        uint256 id;
        string location;
        uint256 price;
        address owner;
        bool sold;
    }


    mapping(uint256 => Property) public properties;
    uint256 public nextPropertyId;


    event PropertyListed(uint256 indexed id, string location, uint256 price);
    event PropertySold(uint256 indexed id, address buyer);


    function listProperty(string memory _location, uint256 _price) external {
        require(_price > 0, "Price must be greater than 0");
        properties[nextPropertyId] = Property({
            id: nextPropertyId,
            location: _location,
            price: _price,
            owner: msg.sender,
            sold: false
        });
        emit PropertyListed(nextPropertyId, _location, _price);
        nextPropertyId++;
    }


    function buyProperty(uint256 _id) external payable {
        Property storage property = properties[_id];
        require(property.owner != address(0), "Invalid property ID"); // Moved up
        require(!property.sold, "Property already sold");
        require(msg.value == property.price, "Incorrect payment amount");

        property.sold = true;
        payable(property.owner).transfer(msg.value);
        emit PropertySold(_id, msg.sender);
    }


    function getProperty(uint256 _id) external view returns (Property memory) {
        return properties[_id];
    }
}
