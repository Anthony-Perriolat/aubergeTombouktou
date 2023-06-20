import express, { Request, Response } from 'express';
import path from 'path';
import usersRoutes from './routes/users';
import bookingsRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import categoriesArticleRoutes from './routes/categoriesArticle';
import roomsRoutes from './routes/rooms';
import articlesRoutes from './routes/articles';
const cors = require('cors');
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Une erreur est survenue!');
});
app.use('/api/users', usersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/bookings/payment', paymentRoutes);
app.use('/api/categoriesArticle', categoriesArticleRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/articles', articlesRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/api/', (req, res) => {
  res.status(200).send("Bienvenue sur l'api de reservation destiné aux chambre d'hote et d'hotel");
});

app.get('*', (req, res) => {
  res.status(404).send("Désolé, cette page n'existe pas!");
});


export default app;