import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const id = '69bce38e72f8ecc256129f74';
const role = 'admin';
const secret = process.env.JWT_SECRET || 'supersecret123';

const token = jwt.sign({ id, role }, secret, { expiresIn: '7d' });

console.log('--- TOKEN START ---');
console.log(token);
console.log('--- TOKEN END ---');
