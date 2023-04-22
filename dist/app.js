"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const users_1 = __importDefault(require("./routes/users"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const payments_1 = __importDefault(require("./routes/payments"));
const categoriesArticle_1 = __importDefault(require("./routes/categoriesArticle"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const articles_1 = __importDefault(require("./routes/articles"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Une erreur est survenue!');
});
app.use('/api/users', users_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/bookings/payment', payments_1.default);
app.use('/api/categoriesArticle', categoriesArticle_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/articles', articles_1.default);
app.use('/images', express_1.default.static(path_1.default.join(__dirname, 'images')));
app.get('/api/', (req, res) => {
    res.status(404).send("Bienvenue sur l'api de reservation destiné aux chambre d'hote et d'hotel");
});
app.get('*', (req, res) => {
    res.status(404).send("Désolé, cette page n'existe pas!");
});
exports.default = app;
