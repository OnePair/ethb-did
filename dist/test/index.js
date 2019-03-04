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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var src_1 = require("../src");
var providers_1 = require("ethers/providers");
var ganache_cli_1 = __importDefault(require("ganache-cli"));
var web3_1 = __importDefault(require("web3"));
describe("Testing EthBDID", function () {
    var IPFS_HOST = "/ip4/127.0.0.1/tcp/5001";
    var RPC_HOST = "http://127.0.0.1:9545";
    var ethServer;
    var rpcProvider;
    var web3;
    var account1;
    var account2;
    var did;
    var did2;
    var authPrivateKey = "80226bf3ec016b9d3b7d9037fe3008889977a57f43e9bb8484d59f77c58e9777";
    var authPublicKey = "04f88e3cec86d4b5f6c731a1e42a0f81ec821413ce1b87f605bf3cc16a3d39715a039201a4b32e57d744163cb04034c2b47816d3e29e173f5af8347642126849d2";
    var authPrivateKey2 = "da69e93e09a580b5a251443f23cc7896b52fc03d2d2d664c1b1be6f67c214517";
    var authPublicKey2 = "04ec672413ab475edf7cedae136e332b313ba236117f73adada71f1f35d35b8ddd89fd3410df4dfd510422c2ed52f9ae92e84b354799acb6ec287382d6d62b0243";
    var processorPrivateKey1 = "f63ab2c512855fe04538134fb724f71d6c94bfa101d4f6d20fc8d762a99bfd12";
    var processorPublicKey1 = "0402a38afd02d42fcacdfebba15bceeb711d704ab62be64a3a55f670278cdf9f1053b53b17c74428295ed1b2cb2f013d616ede3be68a0de7b3d1c2464ff97eb5f2";
    var invalidProcessorPrivateKey = "98e4c768daaf9426812be2dbfb35748edbc3468553c76b351bc952c9fc770114";
    var invalidProcessorPublicKey = "04f9e999afe15387350b22966e7f37fb175edf8a7c2eddc4596c0f8125514944bb96b889c08881d5741399926016681f5d544f1b28051825413610e5a119229fe6";
    var processor1;
    var invalidProcessor;
    before(function () { return __awaiter(_this, void 0, void 0, function () {
        var accounts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    src_1.EthBDID.connectToIpfs(IPFS_HOST);
                    ethServer = ganache_cli_1.default.server();
                    ethServer.listen(9545);
                    rpcProvider = new providers_1.JsonRpcProvider(RPC_HOST);
                    web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(RPC_HOST));
                    return [4 /*yield*/, web3.eth.getAccounts()];
                case 1:
                    accounts = _a.sent();
                    account1 = web3.eth.accounts.create();
                    account2 = web3.eth.accounts.create();
                    return [4 /*yield*/, web3.eth.sendTransaction({
                            from: accounts[1],
                            to: account1["address"],
                            value: '5002465260000000000'
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, web3.eth.sendTransaction({
                            from: accounts[1],
                            to: account2["address"],
                            value: '5002465260000000000'
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe("Create.", function () {
        it("Should create a new DID", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    src_1.EthBDID.create(account1["privateKey"], account1["address"], authPublicKey, rpcProvider).then(function (did) {
                        _this.did = did;
                        done();
                    }).catch(function (err) {
                        throw new Error(err["err"]);
                    });
                    return [2 /*return*/];
                });
            }); });
        });
    });
    describe("Update", function () {
        it("Should set a new controller key", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.did.setController(account2["address"], account1["privateKey"])
                        .then(function () {
                        done();
                    }).catch(function (err) {
                        throw new Error(err["err"]);
                    });
                    return [2 /*return*/];
                });
            }); });
        });
        it("Should set a new authorization key", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.did.setAuthorizationKey(authPublicKey2, account2["privateKey"])
                        .then(function () {
                        done();
                    }).catch(function (err) {
                        throw new Error(err["err"]);
                    });
                    return [2 /*return*/];
                });
            }); });
        });
    });
    /*
    * TODO: Check expired
    */
    describe("Processors", function () {
        before(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Creating a second did...");
                        _a = this;
                        return [4 /*yield*/, src_1.EthBDID.create(account1["privateKey"], account2["address"], authPublicKey, rpcProvider)];
                    case 1:
                        _a.did2 = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Should authorize new processors", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.processor1 = this.did.authorizeProcessor(processorPublicKey1, true, true, authPrivateKey2);
                    this.invalidProcessor = this.did2.authorizeProcessor(invalidProcessorPublicKey, true, true, authPrivateKey);
                    done();
                    return [2 /*return*/];
                });
            }); });
        });
        it("Processor should be valid", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.did.verifyProcessor(this.processor1, "auth").then(function () {
                        done();
                    }).catch(function (err) {
                        console.log("ERROR:", err);
                        throw new Error(err["err"]);
                    });
                    return [2 /*return*/];
                });
            }); });
        });
        it("Processor should have an invalid signature", function (done) {
            _this.did.verifyProcessor(_this.invalidProcessor, "auth").then(function (result) {
                chai_1.expect(result["valid"]).equal(false);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(false);
                done();
            });
        });
        it("Processor should have inadequate permissions", function (done) {
            _this.did.verifyProcessor(_this.processor1, "delegate").then(function (result) {
                chai_1.expect(result["valid"]).equal(false);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(false);
                done();
            });
        });
        it("Should revoke processor", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.did.revokeProcessorKey(processorPublicKey1, account2["privateKey"]).then(function (tx) {
                        done();
                    }).catch(function (err) {
                        throw new Error(err["err"]);
                    });
                    return [2 /*return*/];
                });
            }); });
        });
        it("Processor should be revoked", function (done) {
            _this.did.verifyProcessor(_this.processor1, "auth").then(function (result) {
                chai_1.expect(result["valid"]).equal(false);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(false);
                done();
            });
        });
    });
    describe("did-jwt", function () {
        var jwt;
        var invalidJwt;
        var processorJwt;
        var invalidProcessorJwt;
        var claims = { key: "value" };
        before(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                processorPrivateKey1 = "313dbbe0903399779ee99e04ded8166fe2dd31b801671610592823433db07814";
                processorPublicKey1 = "04d921d5e61a2f0a08a9054604d8608284dcafdc2035f766cc30153aef713035915f24edfe857326551911c6180cc802b35b4b47217221c3e20b34b9fa7d7efccd";
                this.processor1 = this.did.authorizeProcessor(processorPublicKey1, true, true, authPrivateKey2);
                return [2 /*return*/];
            });
        }); });
        it("Should create a jwt", function (done) {
            chai_1.assert.doesNotThrow(function () {
                _this.jwt = _this.did.createJwt(claims, "1 day", authPrivateKey2);
                _this.invalidJwt = _this.did2.createJwt(claims, "1 day", authPrivateKey);
                done();
            });
        });
        it("Jwt should be valid", function (done) {
            _this.did.verifyJwt(_this.jwt, "signing").then(function (result) {
                chai_1.expect(result["valid"]).equal(true);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(true);
                done();
            });
        });
        it("Jwt should be invalid", function (done) {
            _this.did.verifyJwt(_this.invalidJwt, "signing").then(function (result) {
                chai_1.expect(result["valid"]).equal(false);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(false);
                done();
            });
        });
        it("Should create a jwt with processor", function (done) {
            chai_1.assert.doesNotThrow(function () {
                _this.processorJwt = _this.processor1.createJwt({ key: "value" }, "1d", processorPrivateKey1);
                _this.invalidProcessorJwt = _this.invalidProcessor.createJwt({ key: "value" }, "1d", invalidProcessorPrivateKey);
                done();
            });
        });
        it("Jwt created by processor should be valid", function (done) {
            _this.did.verifyJwt(_this.processorJwt, "signing").then(function (result) {
                chai_1.expect(result["valid"]).equal(true);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(true);
                done();
            });
        });
        it("Jwt created by the wrong processor should be invalid", function (done) {
            _this.did.verifyJwt(_this.invalidProcessorJwt, "signing").then(function (result) {
                chai_1.expect(result["valid"]).equal(false);
                done();
            }).catch(function (err) {
                chai_1.expect(err["valid"]).equal(false);
                done();
            });
        });
    });
    after(function () {
        ethServer.close();
    });
});
