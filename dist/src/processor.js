"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var key_encoder_1 = __importDefault(require("key-encoder"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var JWT_SIG_ALGORITHM = "ES256"; // The only one supported for now
var KEY_ENCODER = new key_encoder_1.default("secp256k1");
var DOC_TYPE = "ethb-did-processor";
var Processor = /** @class */ (function () {
    function Processor(token, issuer, publicKey, permissions) {
        this.token = token;
        this.issuer = issuer;
        this.publicKey = publicKey;
        this.permissions = permissions;
    }
    Processor.prototype.createJwt = function (claims, expiresIn, privateKeyHex) {
        claims["algorithm"] = JWT_SIG_ALGORITHM;
        claims["issuer"] = {
            type: "processor",
            processor: this.getToken()
        };
        claims["expiresIn"] = expiresIn;
        var encodedPrivateKey = KEY_ENCODER.encodePrivate(privateKeyHex, "raw", "pem");
        var token = jsonwebtoken_1.default.sign(claims, encodedPrivateKey, { algorithm: 'ES256' });
        return token;
    };
    Processor.prototype.getToken = function () {
        return this.token;
    };
    Processor.prototype.getIssuer = function () {
        return this.issuer;
    };
    Processor.prototype.getPublicKey = function () {
        return this.publicKey;
    };
    Processor.prototype.getPermissions = function () {
        return this.permissions;
    };
    Processor.parse = function (token) {
        var decodedToken = jsonwebtoken_1.default.decode(token);
        return new Processor(token, decodedToken["issuer"], decodedToken["publicKey"], decodedToken["permissions"]);
    };
    Processor.createUnauthorized = function (publicKey, auth, signing) {
        var permissions = [];
        if (auth)
            permissions.push("auth");
        if (signing)
            permissions.push("signing");
        return { publicKey: publicKey, permissions: permissions, type: DOC_TYPE };
    };
    return Processor;
}());
exports.Processor = Processor;
