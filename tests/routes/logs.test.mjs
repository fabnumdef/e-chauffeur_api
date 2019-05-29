import { generateDriverJWTHeader, generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import { testList } from '../helpers/crud';

const Log = { modelName: 'log' };

describe('Test the car API endpoint', () => {
  it(...testList(Log, {
    route: '/logs',
    cannotCall: [generateDriverJWTHeader, generateRegulatorJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));
});
