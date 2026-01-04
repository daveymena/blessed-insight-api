try {
    console.log('Testing imports...');
    require('dotenv').config();
    console.log('dotenv ok');
    require('express');
    console.log('express ok');
    require('cors');
    console.log('cors ok');
    require('@prisma/client');
    console.log('prisma ok');
    require('bcryptjs');
    console.log('bcryptjs ok');

    console.log('All modules loaded successfully');
} catch (e) {
    console.error('Import failed:', e);
}
