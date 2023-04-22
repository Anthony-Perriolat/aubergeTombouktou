"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.signUpUser = exports.login = exports.getAllUsers = exports.deleteMyUser = exports.updateMyUser = exports.getMyUser = void 0;
/// <reference path="../middleware/index.d.ts" />
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const senderMail_1 = require("../lib/senderMail");
const regex_1 = require("../lib/regex");
const client_1 = __importDefault(require("../client"));
const getMyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idMyUser = req.auth.userId;
    try {
        const result = yield client_1.default.user.findUnique({
            where: {
                id: idMyUser,
            },
        });
        if (!result) {
            // gestion de l'erreur si aucun utilisateur n'est trouvé
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        const { password } = result, fieldUser = __rest(result
        // delete result.password;
        , ["password"]);
        // delete result.password;
        res.status(200).json(fieldUser);
    }
    catch (_a) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getMyUser = getMyUser;
const updateMyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idMyUser = req.auth.userId;
    const dataToUpdate = req.body.data;
    if (dataToUpdate.email) {
        (0, regex_1.ValidateEmail)(dataToUpdate.email) ? null : res.status(400).json({ message: 'e-mail invalide' });
    }
    try {
        const result = yield client_1.default.user.update({
            where: { id: Number(idMyUser) },
            data: dataToUpdate,
        });
        dataToUpdate['email'] ? (0, senderMail_1.sendMailUpdateEmail)({ nameUser: `${result.lastName} ${result.firstName}`, email: result.email }) : null;
        res.status(201).json(result);
    }
    catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.updateMyUser = updateMyUser;
const deleteMyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idMyUser = req.auth.userId;
    try {
        const result = yield client_1.default.user.delete({
            where: {
                id: Number(idMyUser),
            },
        });
        const { password } = result, fieldUser = __rest(result, ["password"]);
        (0, senderMail_1.sendMailGoodbye)({ nameUser: `${result.lastName} ${result.firstName}`, email: result.email });
        res.status(201).json(fieldUser);
    }
    catch (_b) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.deleteMyUser = deleteMyUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.default.user.findMany();
        res.status(200).json(result);
    }
    catch (_c) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getAllUsers = getAllUsers;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body.data;
    if (!(0, regex_1.ValidateEmail)(email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    }
    try {
        const foundUser = yield client_1.default.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!foundUser) {
            res.status(401).json({ message: 'mauvaise combinaison de mdp et mail' });
        }
        else {
            if (!foundUser.password) {
                res.status(400).json({ message: "Le mot de passe est vide" });
            }
            const valid = yield bcrypt_1.default.compare(password, foundUser.password);
            if (!valid) {
                res.status(401).json({ message: 'mauvaise combinaison de mdp et mail' });
            }
            res.status(200).json({
                userId: foundUser.id,
                token: jsonwebtoken_1.default.sign({ userId: foundUser.id }, `${process.env.TOKEN_SECRET}`, { expiresIn: process.env.TIME_LIVE_TOKEN }),
            });
        }
    }
    catch (err) {
        res.status(401).json({ message: 'mauvaise combinaison de mdp et mail' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.login = login;
const signUpUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    try {
        if (!(0, regex_1.ValidateEmail)(data.email)) {
            res.status(400).json({ message: 'e-mail invalide' });
        }
        else {
            const hash = yield bcrypt_1.default.hash(data.password, 10);
            const result = yield client_1.default.user.create({
                data: Object.assign(Object.assign({}, data), { password: hash }),
            });
            (0, senderMail_1.sendMailWelcome)({ nameUser: `${result.lastName} ${result.firstName}`, email: result.email });
            const { password } = result, fieldUser = __rest(result, ["password"]);
            res.status(201).json(fieldUser);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "l'utilisateur existe déjà ou une erreur c'est produite" });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.signUpUser = signUpUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const dataToUpdate = req.body.data;
    if (dataToUpdate.email) {
        (0, regex_1.ValidateEmail)(dataToUpdate.email) ? null : res.status(400).json({ message: 'e-mail invalide' });
    }
    try {
        const result = yield client_1.default.user.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.updateUser = updateUser;
