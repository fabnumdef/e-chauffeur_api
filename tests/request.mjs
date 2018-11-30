import request from 'supertest';
import '../services';
import app from '../app';

export default () => request(app.listen());
