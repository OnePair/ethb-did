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
var ethb_did_1 = require("./ethb-did");
var util_1 = __importDefault(require("util"));
var crypto_1 = __importDefault(require("crypto"));
// Revocation list for the processor keys
var IPFSRevocationList = /** @class */ (function () {
    function IPFSRevocationList(address) {
        this.address = address;
    }
    /*
    * Public functions.
    */
    /*
    * Revoke a processor key.
    *
    * @param {string} processorKey The processor's public key.
    *
    * @return {string} The new revocation address.
    */
    IPFSRevocationList.prototype.revokeProcessorKey = function (processorKey) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keyHash, revocationObject, revokedProcessorKeys, address, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        keyHash = crypto_1.default.createHash("sha256")
                            .update(processorKey)
                            .digest("hex");
                        return [4 /*yield*/, this.getRevocationList()];
                    case 1:
                        revocationObject = _a.sent();
                        revokedProcessorKeys = revocationObject["processorKeys"];
                        if (!(revokedProcessorKeys.indexOf(keyHash) == -1)) return [3 /*break*/, 3];
                        revokedProcessorKeys.push(keyHash);
                        return [4 /*yield*/, this.updateRevocationList(revokedProcessorKeys)];
                    case 2:
                        address = _a.sent();
                        onSuccess(address);
                        return [3 /*break*/, 4];
                    case 3:
                        onSuccess(null);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        onError(err_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Check if a processor key has been revoked.
    *
    * @param {Processor} processor The processor.
    *
    * @param {Promise<boolean>} The revocation result.
    */
    IPFSRevocationList.prototype.isProcessorRevoked = function (processor) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keyHash, revocationObject, revokedProcessorKeys, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        keyHash = crypto_1.default.createHash("sha256")
                            .update(processor.getPublicKey())
                            .digest("hex");
                        return [4 /*yield*/, this.getRevocationList()];
                    case 1:
                        revocationObject = _a.sent();
                        revokedProcessorKeys = revocationObject["processorKeys"];
                        // Check if the processor key is in the list of revoked keys
                        if (revokedProcessorKeys.indexOf(keyHash) == -1) {
                            onSuccess(false);
                        }
                        else {
                            onSuccess(true);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        onError(err_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    IPFSRevocationList.prototype.getAddress = function () {
        return this.address;
    };
    /*
    * Private functions.
    */
    IPFSRevocationList.prototype.getRevocationList = function () {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var revocationUrl;
            return __generator(this, function (_a) {
                try {
                    // If none exists
                    if (this.address == undefined || this.address == null || this.address.length == 0) {
                        onSuccess({ "processorKeys": [] });
                    }
                    else {
                        revocationUrl = util_1.default.format("/ipfs/%s", this.address);
                        ethb_did_1.EthBDID.ipfsApi.cat(revocationUrl, function (err, file) {
                            if (err) {
                                onError(err);
                            }
                            else {
                                var revocationObject = JSON.parse(file.toString());
                                onSuccess(revocationObject);
                            }
                        });
                    }
                }
                catch (err) {
                    onError(err);
                }
                return [2 /*return*/];
            });
        }); });
    };
    IPFSRevocationList.prototype.updateRevocationList = function (processorKeys) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var revocationObject, buffer;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    revocationObject = { "processorKeys": processorKeys };
                    buffer = Buffer.from(JSON.stringify(revocationObject));
                    ethb_did_1.EthBDID.ipfsApi.add(buffer, function (err, fileInfo) {
                        if (err) {
                            onError(err);
                        }
                        else {
                            _this.address = fileInfo[0]["hash"];
                            onSuccess(_this.address);
                        }
                    });
                }
                catch (err) {
                    onError(err);
                }
                return [2 /*return*/];
            });
        }); });
    };
    return IPFSRevocationList;
}());
exports.IPFSRevocationList = IPFSRevocationList;
