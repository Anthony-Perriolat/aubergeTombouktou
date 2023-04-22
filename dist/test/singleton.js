"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
jest.mock('../client', () => ({
    __esModule: false,
    default: (0, jest_mock_extended_1.mockDeep)(),
}));
// // export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
// import { PrismaClient } from '@prisma/client';
// import faker from '@faker'
// const prisma = new PrismaClient();
// export default prisma;
// // Pour tester la connexion à la base de données dans Jest
// beforeAll(async () => {
//   await prisma.$connect();
//   const users = [...Array(10)].map(() => ({
//     lastName: faker.name.lastName(),
//     firstName: faker.name.firstName(),
//     email: faker.internet.email(),
//     phone: faker.phone.phoneNumber(),
//     nationality: faker.address.country(),
//     permission: 'customer',
//     password: faker.internet.password()
//   }))
//   // Insérer les utilisateurs dans la base de données
//   await prisma.user.createMany({
//     data: users
//   })
// });
// // Pour déconnecter de la base de données après avoir exécuté tous les tests Jest
// afterAll(async () => {
//   await prisma.$disconnect();
// });
