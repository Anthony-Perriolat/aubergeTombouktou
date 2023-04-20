import express, { NextFunction } from 'express';
import path from 'path';
import usersRoutes from './routes/users';
import bookingsRoutes from './routes/bookings';
import categoriesArticleRoutes from './routes/categoriesArticle';
import roomsRoutes from './routes/rooms';
import articlesRoutes from './routes/articles';
const app = express();

app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/categoriesArticle', categoriesArticleRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/articles', articlesRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('*', (req, res) => {
  res.status(404).send("Désolé, cette page n'existe pas!");
});

export default app;