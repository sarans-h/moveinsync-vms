const axios = require('axios');

// Function to register a vendor
async function registerVendor(vendorData) {
  try {
    const response = await axios.post('http://localhost:3001/api/vendors/register', vendorData);
    
    console.log('Vendor registered successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error registering vendor:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Register a national vendor
async function registerNationalVendor() {
  console.log('Registering national vendor...');
  const vendorData = {
    name: 'National Vendor',
    email: 'national@example.com',
    password: 'National123',
    vendorLevel: 'national',
    vendorIdentity: 'NV001',
    location: {
      address: '123 National Street',
      city: 'National City',
      state: 'National State',
      country: 'Country',
      coordinates: [0, 0]
    },
    contact: {
      phone: '+1234567890'
    }
  };
  
  return await registerVendor(vendorData);
}

// Register a regional vendor
async function registerRegionalVendor(parentId) {
  console.log('Registering regional vendor...');
  const vendorData = {
    name: 'Regional Vendor',
    email: 'regional@example.com',
    password: 'Regional123',
    vendorLevel: 'regional',
    vendorIdentity: 'RV001',
    parentId,
    location: {
      address: '123 Regional Street',
      city: 'Regional City',
      state: 'Regional State',
      country: 'Country',
      coordinates: [0, 0]
    },
    contact: {
      phone: '+1234567891'
    }
  };
  
  return await registerVendor(vendorData);
}

// Register a state vendor
async function registerStateVendor(parentId) {
  console.log('Registering state vendor...');
  const vendorData = {
    name: 'State Vendor',
    email: 'state@example.com',
    password: 'State123',
    vendorLevel: 'state',
    vendorIdentity: 'SV001',
    parentId,
    location: {
      address: '123 State Street',
      city: 'State City',
      state: 'State State',
      country: 'Country',
      coordinates: [0, 0]
    },
    contact: {
      phone: '+1234567892'
    }
  };
  
  return await registerVendor(vendorData);
}

// Register a city vendor
async function registerCityVendor(parentId) {
  console.log('Registering city vendor...');
  const vendorData = {
    name: 'City Vendor',
    email: 'city@example.com',
    password: 'City123',
    vendorLevel: 'city',
    vendorIdentity: 'CV001',
    parentId,
    location: {
      address: '123 City Street',
      city: 'City City',
      state: 'City State',
      country: 'Country',
      coordinates: [0, 0]
    },
    contact: {
      phone: '+1234567893'
    }
  };
  
  return await registerVendor(vendorData);
}

// Register a local vendor
async function registerLocalVendor(parentId) {
  console.log('Registering local vendor...');
  const vendorData = {
    name: 'Local Vendor',
    email: 'local@example.com',
    password: 'Local123',
    vendorLevel: 'local',
    vendorIdentity: 'LV001',
    parentId,
    location: {
      address: '123 Local Street',
      city: 'Local City',
      state: 'Local State',
      country: 'Country',
      coordinates: [0, 0]
    },
    contact: {
      phone: '+1234567894'
    }
  };
  
  return await registerVendor(vendorData);
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    if (command === 'national') {
      const result = await registerNationalVendor();
      console.log('National vendor ID:', result.data.vendor._id);
    } else if (command === 'regional') {
      const parentId = args[1];
      if (!parentId) {
        console.error('Please provide a parent vendor ID');
        process.exit(1);
      }
      const result = await registerRegionalVendor(parentId);
      console.log('Regional vendor ID:', result.data.vendor._id);
    } else if (command === 'state') {
      const parentId = args[1];
      if (!parentId) {
        console.error('Please provide a parent vendor ID');
        process.exit(1);
      }
      const result = await registerStateVendor(parentId);
      console.log('State vendor ID:', result.data.vendor._id);
    } else if (command === 'city') {
      const parentId = args[1];
      if (!parentId) {
        console.error('Please provide a parent vendor ID');
        process.exit(1);
      }
      const result = await registerCityVendor(parentId);
      console.log('City vendor ID:', result.data.vendor._id);
    } else if (command === 'local') {
      const parentId = args[1];
      if (!parentId) {
        console.error('Please provide a parent vendor ID');
        process.exit(1);
      }
      const result = await registerLocalVendor(parentId);
      console.log('Local vendor ID:', result.data.vendor._id);
    } else {
      console.log('Usage: node register-vendor.js [national|regional|state|city|local] [parentId]');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to register vendor');
    process.exit(1);
  }
}

main().catch(console.error); 