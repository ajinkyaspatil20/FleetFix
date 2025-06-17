const express = require('express');
const cors = require('cors');
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Global error handler for uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => (value * Math.PI) / 180;

// Sample garage data
const garages = [
  // Kalyan Garages
  {
    name: 'Kalyan Auto Care Center',
    lat: 19.2403,
    lng: 73.1305,
    address: '123 Station Road, Near Railway Station, Kalyan West',
    contact: '+91 98765 43801'
  },
  {
    name: 'Shilphata Motors',
    lat: 19.2338,
    lng: 73.1577,
    address: '456 Shilphata Road, Near MIDC, Kalyan East',
    contact: '+91 98765 43802'
  },
  {
    name: 'Titwala Service Hub',
    lat: 19.2947,
    lng: 73.1919,
    address: '789 Titwala Road, Near Railway Station, Titwala',
    contact: '+91 98765 43803'
  },
  {
    name: 'Dombivli Auto Works',
    lat: 19.2183,
    lng: 73.0876,
    address: '321 Manpada Road, Dombivli East',
    contact: '+91 98765 43804'
  },
  {
    name: 'Kalyan Service Station',
    lat: 19.2359,
    lng: 73.1294,
    address: '567 Agra Road, Near Birla College, Kalyan West',
    contact: '+91 98765 43805'
  },
  // Pen, Raigad Garages
  {
    name: 'Pen Auto Care',
    lat: 18.7373,
    lng: 73.0960,
    address: '123 Main Road, Near Bus Stand, Pen',
    contact: '+91 98765 43901'
  },
  {
    name: 'Highway Motors Pen',
    lat: 18.7447,
    lng: 73.0982,
    address: '456 Mumbai-Goa Highway, Pen',
    contact: '+91 98765 43902'
  },
  {
    name: 'Pen City Service Center',
    lat: 18.7320,
    lng: 73.0967,
    address: '789 Market Road, Near Police Station, Pen',
    contact: '+91 98765 43903'
  },
  {
    name: 'Raigad Auto Hub',
    lat: 18.7397,
    lng: 73.0901,
    address: '321 College Road, Near Pen Railway Station',
    contact: '+91 98765 43904'
  },
  {
    name: 'Express Auto Solutions Pen',
    lat: 18.7334,
    lng: 73.0994,
    address: '567 Vadkhal Road, Pen, Raigad',
    contact: '+91 98765 43905'
  },
  // Mumbai Garages
  {
    name: 'Kurla West Auto Hub',
    lat: 19.0726,
    lng: 72.8845,
    address: '123 LBS Marg, Kurla West, Mumbai',
    contact: '+91 98765 43210'
  },
  {
    name: 'Express Auto Solutions',
    lat: 19.0850,
    lng: 72.8900,
    address: '456 Bandra West, Mumbai',
    contact: '+91 98765 43211'
  },
  {
    name: 'Quick Fix Motors',
    lat: 19.0650,
    lng: 72.8650,
    address: '789 Worli, Mumbai',
    contact: '+91 98765 43212'
  },
  {
    name: 'Dadar Auto Hub',
    lat: 19.0178,
    lng: 72.8478,
    address: '234 Dadar East, Mumbai',
    contact: '+91 98765 43213'
  },
  {
    name: 'Parel Service Center',
    lat: 18.9977,
    lng: 72.8376,
    address: '567 Lower Parel, Mumbai',
    contact: '+91 98765 43214'
  },
  // Pune Garages
  {
    name: 'Kothrud Auto Care',
    lat: 18.5018,
    lng: 73.8007,
    address: '123 Kothrud Main Road, Pune',
    contact: '+91 98765 43301'
  },
  {
    name: 'Hinjewadi Motors',
    lat: 18.5912,
    lng: 73.7375,
    address: '456 IT Park Road, Hinjewadi, Pune',
    contact: '+91 98765 43302'
  },
  {
    name: 'Hadapsar Service Station',
    lat: 18.4971,
    lng: 73.9430,
    address: '789 Magarpatta Road, Hadapsar, Pune',
    contact: '+91 98765 43303'
  },
  {
    name: 'Shivaji Nagar Garage',
    lat: 18.5314,
    lng: 73.8446,
    address: '321 FC Road, Shivaji Nagar, Pune',
    contact: '+91 98765 43304'
  },
  {
    name: 'Aundh Auto Hub',
    lat: 18.5584,
    lng: 73.8072,
    address: '567 DP Road, Aundh, Pune',
    contact: '+91 98765 43305'
  },
  // Bangalore Garages
  {
    name: 'Whitefield Service Center',
    lat: 12.9698,
    lng: 77.7500,
    address: '123 ITPL Main Road, Whitefield, Bangalore',
    contact: '+91 98765 43401'
  },
  {
    name: 'Electronic City Motors',
    lat: 12.8458,
    lng: 77.6692,
    address: '456 Electronics City Phase 1, Bangalore',
    contact: '+91 98765 43402'
  },
  {
    name: 'Indiranagar Auto Works',
    lat: 12.9719,
    lng: 77.6412,
    address: '789 100 Feet Road, Indiranagar, Bangalore',
    contact: '+91 98765 43403'
  },
  {
    name: 'Koramangala Garage',
    lat: 12.9279,
    lng: 77.6271,
    address: '321 80 Feet Road, Koramangala, Bangalore',
    contact: '+91 98765 43404'
  },
  {
    name: 'HSR Layout Service Hub',
    lat: 12.9116,
    lng: 77.6474,
    address: '567 27th Main Road, HSR Layout, Bangalore',
    contact: '+91 98765 43405'
  },
  // Delhi Garages
  {
    name: 'Connaught Place Auto Care',
    lat: 28.6329,
    lng: 77.2195,
    address: '123 Barakhamba Road, Connaught Place, Delhi',
    contact: '+91 98765 43501'
  },
  {
    name: 'Dwarka Motors',
    lat: 28.5921,
    lng: 77.0460,
    address: '456 Sector 12, Dwarka, Delhi',
    contact: '+91 98765 43502'
  },
  {
    name: 'Rohini Service Station',
    lat: 28.7158,
    lng: 77.1367,
    address: '789 Sector 3, Rohini, Delhi',
    contact: '+91 98765 43503'
  },
  {
    name: 'Lajpat Nagar Garage',
    lat: 28.5700,
    lng: 77.2400,
    address: '321 Defence Colony, Lajpat Nagar, Delhi',
    contact: '+91 98765 43504'
  },
  {
    name: 'Vasant Kunj Auto Hub',
    lat: 28.5200,
    lng: 77.1600,
    address: '567 Sector B, Vasant Kunj, Delhi',
    contact: '+91 98765 43505'
  },
  // Chennai Garages
  {
    name: 'Anna Nagar Service Center',
    lat: 13.0850,
    lng: 80.2101,
    address: '123 2nd Avenue, Anna Nagar, Chennai',
    contact: '+91 98765 43601'
  },
  {
    name: 'Velachery Motors',
    lat: 12.9815,
    lng: 80.2180,
    address: '456 100 Feet Road, Velachery, Chennai',
    contact: '+91 98765 43602'
  },
  {
    name: 'T Nagar Auto Works',
    lat: 13.0418,
    lng: 80.2341,
    address: '789 Usman Road, T Nagar, Chennai',
    contact: '+91 98765 43603'
  },
  {
    name: 'Adyar Garage',
    lat: 13.0012,
    lng: 80.2565,
    address: '321 LB Road, Adyar, Chennai',
    contact: '+91 98765 43604'
  },
  {
    name: 'OMR Service Hub',
    lat: 12.9010,
    lng: 80.2279,
    address: '567 Rajiv Gandhi Salai, OMR, Chennai',
    contact: '+91 98765 43605'
  },
  // Kolkata Garages
  {
    name: 'Park Street Auto Care',
    lat: 22.5550,
    lng: 88.3512,
    address: '123 Park Street Area, Kolkata',
    contact: '+91 98765 43701'
  },
  {
    name: 'Salt Lake Motors',
    lat: 22.5800,
    lng: 88.4200,
    address: '456 Sector 5, Salt Lake City, Kolkata',
    contact: '+91 98765 43702'
  },
  {
    name: 'New Town Service Station',
    lat: 22.5800,
    lng: 88.4700,
    address: '789 Action Area 1, New Town, Kolkata',
    contact: '+91 98765 43703'
  },
  {
    name: 'Ballygunge Garage',
    lat: 22.5200,
    lng: 88.3700,
    address: '321 Ballygunge Circular Road, Kolkata',
    contact: '+91 98765 43704'
  },
  {
    name: 'Howrah Auto Hub',
    lat: 22.5900,
    lng: 88.3100,
    address: '567 GT Road, Howrah, Kolkata',
    contact: '+91 98765 43705'
  }
];

// Default route
app.get('/', (req, res) => {
  res.send('Server is running! Use /api/garages to get the garage list.');
});

// API endpoint to get garage locations
app.get('/api/garages', async (req, res) => {
  try {
    if (!Array.isArray(garages)) {
      throw new Error('Garage data is not properly initialized');
    }

    const { lat, lng, radius = 10 } = req.query;
    let filteredGarages = [...garages];

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      if (isNaN(userLat) || isNaN(userLng)) {
        throw new Error('Invalid latitude or longitude parameters');
      }

      filteredGarages = garages.filter(garage => {
        const distance = calculateDistance(userLat, userLng, garage.lat, garage.lng);
        return distance <= radius;
      });
    }

    res.json({
      status: 'success',
      data: filteredGarages,
      count: filteredGarages.length
    });
  } catch (error) {
    console.error('Error fetching garages:', error);
    res.status(error.status || 500).json({
      status: 'error',
      error: error.message || 'Failed to fetch garage data'
    });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});