// Script to add map coordinates and location data to hotels in db.json
const fs = require('fs');
const path = require('path');

// Read db.json
const dbPath = path.join(__dirname, '../../backend/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Coordinates for major Vietnam cities (real coordinates)
const locationData = {
  "1": { // Hanoi Lotus Hotel
    coordinates: {
      latitude: 21.0285,
      longitude: 105.8542
    },
    address: {
      street: "42 Hang Tre Street",
      ward: "Hang Bac Ward",
      district: "Hoan Kiem District",
      city: "Hanoi",
      country: "Vietnam",
      zipCode: "100000",
      fullAddress: "42 Hang Tre Street, Hang Bac Ward, Hoan Kiem District, Hanoi, Vietnam"
    },
    distanceTo: {
      airport: {
        name: "Noi Bai International Airport",
        distance: 25.5,
        unit: "km",
        travelTime: {
          driving: "35 minutes",
          taxi: "40 minutes"
        }
      },
      cityCenter: {
        name: "Hoan Kiem Lake",
        distance: 0.8,
        unit: "km",
        travelTime: {
          walking: "10 minutes",
          driving: "3 minutes"
        }
      },
      trainStation: {
        name: "Hanoi Railway Station",
        distance: 2.3,
        unit: "km",
        travelTime: {
          driving: "8 minutes"
        }
      }
    },
    nearbyPlaces: [
      {
        id: "poi1",
        name: "Hoan Kiem Lake",
        type: "attraction",
        category: "Tourist Attraction",
        distance: 0.8,
        unit: "km",
        rating: 4.7,
        icon: "🏞️"
      },
      {
        id: "poi2",
        name: "Old Quarter",
        type: "attraction",
        category: "Historic District",
        distance: 0.3,
        unit: "km",
        rating: 4.8,
        icon: "🏛️"
      },
      {
        id: "poi3",
        name: "Bun Cha Huong Lien",
        type: "restaurant",
        category: "Vietnamese Restaurant",
        distance: 0.5,
        unit: "km",
        rating: 4.5,
        icon: "🍜"
      },
      {
        id: "poi4",
        name: "Circle K",
        type: "convenience_store",
        category: "Convenience Store",
        distance: 0.2,
        unit: "km",
        rating: 4.2,
        icon: "🏪"
      }
    ]
  },
  "2": { // Danang Beach Resort
    coordinates: {
      latitude: 16.0544,
      longitude: 108.2022
    },
    address: {
      street: "Vo Nguyen Giap Street",
      ward: "Phuoc My Ward",
      district: "Son Tra District",
      city: "Da Nang",
      country: "Vietnam",
      zipCode: "550000",
      fullAddress: "Vo Nguyen Giap Street, Phuoc My Ward, Son Tra District, Da Nang, Vietnam"
    },
    distanceTo: {
      airport: {
        name: "Da Nang International Airport",
        distance: 5.2,
        unit: "km",
        travelTime: {
          driving: "10 minutes",
          taxi: "12 minutes"
        }
      },
      beach: {
        name: "My Khe Beach",
        distance: 0.2,
        unit: "km",
        travelTime: {
          walking: "3 minutes"
        }
      },
      cityCenter: {
        name: "Dragon Bridge",
        distance: 3.5,
        unit: "km",
        travelTime: {
          driving: "8 minutes"
        }
      }
    },
    nearbyPlaces: [
      {
        id: "poi1",
        name: "My Khe Beach",
        type: "attraction",
        category: "Beach",
        distance: 0.2,
        unit: "km",
        rating: 4.9,
        icon: "🏖️"
      },
      {
        id: "poi2",
        name: "Seafood Restaurant",
        type: "restaurant",
        category: "Seafood",
        distance: 0.3,
        unit: "km",
        rating: 4.6,
        icon: "🦞"
      },
      {
        id: "poi3",
        name: "Vincom Plaza",
        type: "shopping",
        category: "Shopping Mall",
        distance: 1.5,
        unit: "km",
        rating: 4.5,
        icon: "🛍️"
      }
    ]
  },
  "3": { // Saigon Skyline Hotel
    coordinates: {
      latitude: 10.7769,
      longitude: 106.7009
    },
    address: {
      street: "123 Nguyen Hue Street",
      ward: "Ben Nghe Ward",
      district: "District 1",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      zipCode: "700000",
      fullAddress: "123 Nguyen Hue Street, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam"
    },
    distanceTo: {
      airport: {
        name: "Tan Son Nhat International Airport",
        distance: 8.5,
        unit: "km",
        travelTime: {
          driving: "20 minutes",
          taxi: "25 minutes"
        }
      },
      cityCenter: {
        name: "Ben Thanh Market",
        distance: 0.5,
        unit: "km",
        travelTime: {
          walking: "6 minutes",
          driving: "2 minutes"
        }
      },
      trainStation: {
        name: "Saigon Railway Station",
        distance: 3.2,
        unit: "km",
        travelTime: {
          driving: "10 minutes"
        }
      }
    },
    nearbyPlaces: [
      {
        id: "poi1",
        name: "Ben Thanh Market",
        type: "attraction",
        category: "Traditional Market",
        distance: 0.5,
        unit: "km",
        rating: 4.4,
        icon: "🛒"
      },
      {
        id: "poi2",
        name: "Nguyen Hue Walking Street",
        type: "attraction",
        category: "Walking Street",
        distance: 0.1,
        unit: "km",
        rating: 4.7,
        icon: "🚶"
      },
      {
        id: "poi3",
        name: "Saigon Opera House",
        type: "attraction",
        category: "Historic Building",
        distance: 0.4,
        unit: "km",
        rating: 4.6,
        icon: "🎭"
      },
      {
        id: "poi4",
        name: "Highlands Coffee",
        type: "cafe",
        category: "Coffee Shop",
        distance: 0.2,
        unit: "km",
        rating: 4.3,
        icon: "☕"
      }
    ]
  },
  "4": { // Nha Trang Pearl Hotel
    coordinates: {
      latitude: 12.2388,
      longitude: 109.1967
    },
    address: {
      street: "Tran Phu Street",
      ward: "Loc Tho Ward",
      district: "Nha Trang City",
      city: "Khanh Hoa",
      country: "Vietnam",
      zipCode: "650000",
      fullAddress: "Tran Phu Street, Loc Tho Ward, Nha Trang City, Khanh Hoa, Vietnam"
    },
    distanceTo: {
      airport: {
        name: "Cam Ranh International Airport",
        distance: 35,
        unit: "km",
        travelTime: {
          driving: "45 minutes",
          taxi: "50 minutes"
        }
      },
      beach: {
        name: "Nha Trang Beach",
        distance: 0.1,
        unit: "km",
        travelTime: {
          walking: "2 minutes"
        }
      },
      cityCenter: {
        name: "Nha Trang Cathedral",
        distance: 2.5,
        unit: "km",
        travelTime: {
          driving: "7 minutes"
        }
      }
    },
    nearbyPlaces: [
      {
        id: "poi1",
        name: "Nha Trang Beach",
        type: "attraction",
        category: "Beach",
        distance: 0.1,
        unit: "km",
        rating: 4.8,
        icon: "🏖️"
      },
      {
        id: "poi2",
        name: "Po Nagar Cham Towers",
        type: "attraction",
        category: "Historic Site",
        distance: 3,
        unit: "km",
        rating: 4.5,
        icon: "🏛️"
      },
      {
        id: "poi3",
        name: "Nha Trang Night Market",
        type: "shopping",
        category: "Night Market",
        distance: 1.5,
        unit: "km",
        rating: 4.4,
        icon: "🌃"
      }
    ]
  },
  "5": { // Hue Imperial Hotel
    coordinates: {
      latitude: 16.4637,
      longitude: 107.5909
    },
    address: {
      street: "Le Loi Street",
      ward: "Phu Hoi Ward",
      district: "Hue City",
      city: "Thua Thien Hue",
      country: "Vietnam",
      zipCode: "530000",
      fullAddress: "Le Loi Street, Phu Hoi Ward, Hue City, Thua Thien Hue, Vietnam"
    },
    distanceTo: {
      airport: {
        name: "Phu Bai International Airport",
        distance: 14,
        unit: "km",
        travelTime: {
          driving: "20 minutes",
          taxi: "25 minutes"
        }
      },
      cityCenter: {
        name: "Hue Imperial City",
        distance: 1.2,
        unit: "km",
        travelTime: {
          walking: "15 minutes",
          driving: "4 minutes"
        }
      },
      trainStation: {
        name: "Hue Railway Station",
        distance: 2.5,
        unit: "km",
        travelTime: {
          driving: "8 minutes"
        }
      }
    },
    nearbyPlaces: [
      {
        id: "poi1",
        name: "Hue Imperial City",
        type: "attraction",
        category: "UNESCO World Heritage",
        distance: 1.2,
        unit: "km",
        rating: 4.9,
        icon: "🏯"
      },
      {
        id: "poi2",
        name: "Perfume River",
        type: "attraction",
        category: "River",
        distance: 0.5,
        unit: "km",
        rating: 4.6,
        icon: "🌊"
      },
      {
        id: "poi3",
        name: "Dong Ba Market",
        type: "shopping",
        category: "Traditional Market",
        distance: 1,
        unit: "km",
        rating: 4.3,
        icon: "🛒"
      }
    ]
  },
  "6": { // Halong Bay Resort
    coordinates: {
      latitude: 20.9594,
      longitude: 107.0427
    },
    address: {
      street: "Halong Road",
      ward: "Bai Chay Ward",
      district: "Halong City",
      city: "Quang Ninh",
      country: "Vietnam",
      zipCode: "200000",
      fullAddress: "Halong Road, Bai Chay Ward, Halong City, Quang Ninh, Vietnam"
    },
    distanceTo: {
      airport: {
        name: "Van Don International Airport",
        distance: 50,
        unit: "km",
        travelTime: {
          driving: "60 minutes",
          taxi: "70 minutes"
        }
      },
      cityCenter: {
        name: "Bai Chay Beach",
        distance: 0.5,
        unit: "km",
        travelTime: {
          walking: "7 minutes",
          driving: "2 minutes"
        }
      },
      beach: {
        name: "Halong Beach",
        distance: 0.3,
        unit: "km",
        travelTime: {
          walking: "5 minutes"
        }
      }
    },
    nearbyPlaces: [
      {
        id: "poi1",
        name: "Halong Bay Cruise Port",
        type: "attraction",
        category: "Tourist Port",
        distance: 1,
        unit: "km",
        rating: 4.8,
        icon: "⛵"
      },
      {
        id: "poi2",
        name: "Sun World Halong Park",
        type: "attraction",
        category: "Amusement Park",
        distance: 2,
        unit: "km",
        rating: 4.7,
        icon: "🎢"
      },
      {
        id: "poi3",
        name: "Seafood Restaurant",
        type: "restaurant",
        category: "Seafood",
        distance: 0.4,
        unit: "km",
        rating: 4.5,
        icon: "🦀"
      }
    ]
  }
};

// Update hotels with location data
db.hotels = db.hotels.map(hotel => {
  const locationInfo = locationData[hotel.id];
  if (locationInfo) {
    return {
      ...hotel,
      ...locationInfo
    };
  }
  return hotel;
});

// Write back to db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Successfully updated db.json with map coordinates and location data!');
console.log(`📍 Updated ${db.hotels.length} hotels with map information`);
