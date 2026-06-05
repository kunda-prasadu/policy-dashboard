const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const regions = [ 'Singapore', 'Hong Kong', 'Australia', 'Japan', 'Thailand','Indonasia', 'Malaysia', 'Philippines'];

const linesOfBusiness = [ 'Property', 'Casualty', 'Marine', 'A&H' ];

const statuses = [ 'Active', 'Expired', 'Cancelled', 'Pending' ];

const currencies = [ 'USD', 'SGD', 'HKD', 'AUD', 'JPY', 'THB', ];

const policies = [];

for (let i=1; i<=250; i++) {
    const effectiveDate = faker.date.past();
    const expiryDate = faker.date.future();

    policies.push({
        id: uuidv4(),
        policyNumber: `POL-${String(i).padStart(6, '0')}`,
        policyHolderName: faker.person.fullName(),
        lineOfBusiness: faker.helpers.arrayElement(linesOfBusiness),
        premiumAmount: faker.number.int({ min: 1000, max: 5000000 }),
        currency: faker.helpers.arrayElement(currencies),
        effectiveDate,
        expiryDate,
        region: faker.helpers.arrayElement(regions),
        underwriter: faker.person.fullName(),
        status: faker.helpers.arrayElement(statuses),
        flaggedForReview: false,
    });
}

fs.writeFileSync('./mock-api/db.json', JSON.stringify({ policies }, null, 2));

console.log('Mock data generated successfully!');
