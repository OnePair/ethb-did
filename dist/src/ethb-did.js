"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var ipfs_revocation_list_1 = require("./ipfs-revocation-list");
var authorization_key_1 = require("./authorization-key");
var processor_1 = require("./processor");
/*if (version !== undefined) { comment this out in index.js
  var message = 'More than one instance of bitcore-lib found. ' +
    'Please make sure to require bitcore-lib and check that submodules do' +
    ' not also include their own bitcore-lib dependency.';
  throw new Error(message);
}*/
var ipfs_api_1 = __importDefault(require("ipfs-api"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var key_encoder_1 = __importDefault(require("key-encoder"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var util_1 = __importDefault(require("util"));
var url_1 = __importDefault(require("url"));
var DID_PATH = "did:ethb:%s";
var JWT_SIG_ALGORITHM = "ES256"; // The only one supported for now
var KEY_ENCODER = new key_encoder_1.default("secp256k1");
var EthBDID = /** @class */ (function () {
    function EthBDID(didUri, controller, authKeyAddress, revocationAddress, provider) {
        this.didUri = didUri;
        this.controller = controller;
        this.authKey = new authorization_key_1.AuthorizationKey(authKeyAddress);
        this.revocationList = new ipfs_revocation_list_1.IPFSRevocationList(revocationAddress);
        this.provider = provider;
    }
    /*
    * Sets a new controller key to the did.
    *
    * @param {string} controllerAddress The new controller Ethereum address.
    * @param {string} privateKey The private key of the current Ethereum address.
    *
    * @return {Promise<object>} The transaction info.
    */
    EthBDID.prototype.setController = function (controllerAddress, privateKey) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var abi, wallet, contractAddress, contract, transaction, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        abi = EthBDID.getAbi();
                        wallet = new ethers_1.Wallet(privateKey, this.provider);
                        contractAddress = url_1.default.parse(this.didUri).pathname.substring(2);
                        contract = new ethers_1.Contract(contractAddress, abi, wallet);
                        return [4 /*yield*/, contract.setController(controllerAddress)];
                    case 1:
                        transaction = _a.sent();
                        // Set locally
                        this.controller = controllerAddress;
                        onSuccess(transaction);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        onError(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Sets a new authorization key to the did.
    *
    * @param {string} authorizationKey The new authorization Ethereum address.
    * @param {string} privateKey The private key of the current controller address.
    *
    * @return {Promise<object>} The transaction info.
    */
    EthBDID.prototype.setAuthorizationKey = function (authKeyHex, privateKey) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var bytecode, abi, wallet, contractAddress, contract, authKey, authKeyAddress, transaction, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        bytecode = EthBDID.getBytecode();
                        abi = EthBDID.getAbi();
                        wallet = new ethers_1.Wallet(privateKey, this.provider);
                        contractAddress = url_1.default.parse(this.didUri).pathname.substring(2);
                        contract = new ethers_1.Contract(contractAddress, abi, wallet);
                        authKey = new authorization_key_1.AuthorizationKey();
                        return [4 /*yield*/, authKey.create(authKeyHex)];
                    case 1:
                        authKeyAddress = _a.sent();
                        return [4 /*yield*/, contract.setAuthorizationKey(authKeyAddress)];
                    case 2:
                        transaction = _a.sent();
                        // Set locally
                        this.authKey = authKey;
                        onSuccess(transaction);
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        onError(err_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * TODO: set expiry as optional parameter
    * Authorize a processor key.
    *
    * @param {string} publicKey The processor public key.
    * @param {boolean} auth Permission for authentication.
    * @param {boolean} signing Permission for signing.
    * @param {string} authPrivateKey The authorization private key.
    *
    * @return {string} Processor The processor object.
    */
    EthBDID.prototype.authorizeProcessor = function (publicKey, auth, signing, authPrivateKey) {
        var unauthorizedProcessor = processor_1.Processor.createUnauthorized(publicKey, auth, signing);
        var authorizedProcessorToken = this.createJwt(unauthorizedProcessor, null, authPrivateKey);
        var authorizedProcessor = processor_1.Processor.parse(authorizedProcessorToken);
        return authorizedProcessor;
    };
    /*
    * Revoke a processor key.
    *
    * @param {string} processorKey The processor public key.
    * @param {string} privateKey The private key of the current controller address.
    *
    * @return {Promise<object>} The transaction info.
    */
    EthBDID.prototype.revokeProcessorKey = function (processorKey, privateKey) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var revocationAddress, abi, wallet, contractAddress, contract, transaction, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.revocationList.revokeProcessorKey(processorKey)];
                    case 1:
                        revocationAddress = _a.sent();
                        if (!(revocationAddress == null)) return [3 /*break*/, 2];
                        // No changes needed
                        onSuccess(null);
                        return [3 /*break*/, 4];
                    case 2:
                        abi = EthBDID.getAbi();
                        wallet = new ethers_1.Wallet(privateKey, this.provider);
                        contractAddress = url_1.default.parse(this.didUri).pathname.substring(2);
                        contract = new ethers_1.Contract(contractAddress, abi, wallet);
                        return [4 /*yield*/, contract.setRevocationAddress(revocationAddress)];
                    case 3:
                        transaction = _a.sent();
                        onSuccess(transaction);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_3 = _a.sent();
                        onError(err_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Create a jwt web token.
    *
    * @param {object} Claims The claims to be signed.
    * @param {string} expiresIn A string describing a time span.
    * @param {string} privateKeyHex The authorization private key.
    *
    * @return {string} The json web token.
    */
    EthBDID.prototype.createJwt = function (claims, expiresIn, privateKeyHex) {
        claims["algorithm"] = JWT_SIG_ALGORITHM;
        claims["issuer"] = {
            type: "controller",
            did: this.didUri
        };
        claims["expiresIn"] = expiresIn;
        var encodedPrivateKey = KEY_ENCODER.encodePrivate(privateKeyHex, "raw", "pem");
        var token = jsonwebtoken_1.default.sign(claims, encodedPrivateKey, { algorithm: 'ES256' });
        return token;
    };
    /*
    * Verifies a EthBDID jwt.
    *
    * @param {string} token The json web token.
    * @param {string} permission The requested permission.
    *
    * @return {object} The verification result.
    */
    EthBDID.prototype.verifyJwt = function (token, permission) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var decodedToken, issuer, issuerDIDUri, publicKeyHex, authKey, processor, decodedPublicKey, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        decodedToken = jsonwebtoken_1.default.decode(token);
                        if (!("issuer" in decodedToken))
                            throw new Error("Invalid jwt format. Issuer field is missing.");
                        issuer = decodedToken["issuer"];
                        issuerDIDUri = void 0;
                        publicKeyHex = void 0;
                        if (!(issuer["type"] == "controller")) return [3 /*break*/, 2];
                        // 1) Get the issuer did
                        issuerDIDUri = issuer["did"];
                        return [4 /*yield*/, this.authKey.load()];
                    case 1:
                        authKey = _a.sent();
                        publicKeyHex = authKey.getPublicKey();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(issuer["type"] == "processor")) return [3 /*break*/, 4];
                        processor = processor_1.Processor.parse(issuer["processor"]);
                        return [4 /*yield*/, this.verifyProcessor(processor, permission)];
                    case 3:
                        _a.sent();
                        // 1) Get the issuer did
                        issuerDIDUri = processor.getIssuer()["did"];
                        // 2) Get the public key
                        publicKeyHex = processor.getPublicKey();
                        return [3 /*break*/, 5];
                    case 4: throw new Error("Invalid jwt. Issuer field is invalid.");
                    case 5:
                        // 1) Check the issuer did
                        if (issuerDIDUri != this.didUri)
                            throw new Error("Wrong issuer DID.");
                        decodedPublicKey = KEY_ENCODER.encodePublic(publicKeyHex, "raw", "pem");
                        // 2) Verify the signature
                        jsonwebtoken_1.default.verify(token, decodedPublicKey, { algorithm: JWT_SIG_ALGORITHM }, function (err) {
                            if (err) {
                                onError({ valid: false, err: err });
                            }
                            else {
                                onSuccess({ valid: true });
                            }
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        err_4 = _a.sent();
                        onError({ valid: false, err: err_4 });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Verify wether a processor is valid.
    *
    * @param {Processor} processor The processor.
    * @param {string} permission What permission it's requesting to use.
    *
    * @return {object} The verification result.
    */
    EthBDID.prototype.verifyProcessor = function (processor, permission) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var issuer, jwtVerified, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        issuer = processor.getIssuer();
                        if (issuer["type"] != "controller")
                            throw new Error("Invalid issuer! The issuer needs to be a controller.");
                        return [4 /*yield*/, this.verifyJwt(processor.getToken(), permission)];
                    case 1:
                        jwtVerified = _a.sent();
                        if (!jwtVerified["valid"])
                            throw new Error(jwtVerified["err"]);
                        // 3) Check permissions
                        if (processor.getPermissions().indexOf(permission) == -1)
                            throw new Error("This processor does not have adequate permissions.");
                        return [4 /*yield*/, this.revocationList.isProcessorRevoked(processor)];
                    case 2:
                        // 4) Check if revoked
                        if (_a.sent())
                            throw new Error("Processor is revoked");
                        ;
                        // 5) Check the controller did
                        onSuccess({ valid: true });
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        onError({ valid: false, err: err_5 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    EthBDID.prototype.getUri = function () {
        return this.didUri;
    };
    EthBDID.prototype.getController = function () {
        return this.controller;
    };
    /*
    * Public static functions.
    */
    /*
    * Create and deploy a new DID to the blockchain.
    *
    * @param {string} privateKey The privateKey of the controller address.
    * @param {string} controller The controller address.
    * @param {string} authKey The key used for authorization.
    * @param {Provider} provider The Ethereum provider.
    */
    EthBDID.create = function (privateKey, controller, authKeyHex, provider) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var bytecode, abi, wallet, contractFactory, authKey, authKeyAddress, contract, didUri, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        bytecode = EthBDID.getBytecode();
                        abi = EthBDID.getAbi();
                        wallet = new ethers_1.Wallet(privateKey, provider);
                        contractFactory = new ethers_1.ContractFactory(abi, bytecode, wallet);
                        authKey = new authorization_key_1.AuthorizationKey();
                        return [4 /*yield*/, authKey.create(authKeyHex)];
                    case 1:
                        authKeyAddress = _a.sent();
                        return [4 /*yield*/, contractFactory.deploy(controller, authKeyAddress)];
                    case 2:
                        contract = _a.sent();
                        didUri = util_1.default.format(DID_PATH, contract.address);
                        onSuccess(new EthBDID(didUri, controller, authKeyAddress, null, provider));
                        return [3 /*break*/, 4];
                    case 3:
                        err_6 = _a.sent();
                        onError(err_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Resolve a did from the network.
    *
    * @param {string} didUri The uri of the did e.g did:ethb:0xbB6270A80031eeB0BAb7aa2E2e3bd60164427886.
    * @param {Provider} provider The Ethereum provider.
    */
    EthBDID.resolve = function (didUri, provider) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var abi, contractAddress, contract, didValues, did, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        abi = EthBDID.getAbi();
                        contractAddress = url_1.default.parse(didUri).pathname.substring(2);
                        contract = new ethers_1.Contract(contractAddress, abi, provider);
                        return [4 /*yield*/, EthBDID.readDidContractValues(contract)];
                    case 1:
                        didValues = _a.sent();
                        did = new EthBDID(didUri, didValues["controller"], didValues["authorizationKey"], didValues["revocationAddress"], provider);
                        onSuccess(did);
                        return [3 /*break*/, 3];
                    case 2:
                        err_7 = _a.sent();
                        onError(err_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Connect to an ipfs node.
    *
    * @param {string} apiUrl The api url if the ipfs node.
    */
    EthBDID.connectToIpfs = function (apiUrl) {
        if (EthBDID.ipfsApi == undefined)
            EthBDID.ipfsApi = ipfs_api_1.default(apiUrl);
    };
    /*
    * The private functions.
    */
    EthBDID.readDidContractValues = function (contract) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var controllerKey, authorizationKey, revocationAddress, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, contract.getController()];
                    case 1:
                        controllerKey = _a.sent();
                        return [4 /*yield*/, contract.getAuthorizationKey()];
                    case 2:
                        authorizationKey = _a.sent();
                        return [4 /*yield*/, contract.getRevocationAddress()];
                    case 3:
                        revocationAddress = _a.sent();
                        onSuccess({
                            controller: controllerKey,
                            authorizationKey: authorizationKey,
                            revocationAddress: revocationAddress
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        err_8 = _a.sent();
                        onError(err_8);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    EthBDID.getBytecode = function () {
        var bytecode = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "./contract/bytecode.json")).toString());
        return "0x" + bytecode["object"];
    };
    EthBDID.getAbi = function () {
        var abi = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "./contract/abi.json")).toString());
        return abi;
    };
    return EthBDID;
}());
exports.EthBDID = EthBDID;
