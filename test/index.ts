import { expect, assert } from "chai";
import { EthBDID, Processor } from "../src"

import { JsonRpcProvider, Web3Provider } from "ethers/providers";
import ganache from "ganache-cli";
import Web3 from "web3";

describe("Testing EthBDID", () => {
  const IPFS_HOST = "/ip4/127.0.0.1/tcp/5001";
  const RPC_HOST = "http://127.0.0.1:9545";

  let ethServer;
  let rpcProvider;
  let web3: Web3;

  let account1;
  let account2;

  let did: EthBDID;
  let did2: EthBDID;

  let authPrivateKey = "80226bf3ec016b9d3b7d9037fe3008889977a57f43e9bb8484d59f77c58e9777"
  let authPublicKey = "04f88e3cec86d4b5f6c731a1e42a0f81ec821413ce1b87f605bf3cc16a3d39715a039201a4b32e57d744163cb04034c2b47816d3e29e173f5af8347642126849d2";

  let authPrivateKey2 = "da69e93e09a580b5a251443f23cc7896b52fc03d2d2d664c1b1be6f67c214517";
  let authPublicKey2 = "04ec672413ab475edf7cedae136e332b313ba236117f73adada71f1f35d35b8ddd89fd3410df4dfd510422c2ed52f9ae92e84b354799acb6ec287382d6d62b0243";

  let processorPrivateKey1 = "f63ab2c512855fe04538134fb724f71d6c94bfa101d4f6d20fc8d762a99bfd12";
  let processorPublicKey1 = "0402a38afd02d42fcacdfebba15bceeb711d704ab62be64a3a55f670278cdf9f1053b53b17c74428295ed1b2cb2f013d616ede3be68a0de7b3d1c2464ff97eb5f2";

  let invalidProcessorPrivateKey = "98e4c768daaf9426812be2dbfb35748edbc3468553c76b351bc952c9fc770114";
  let invalidProcessorPublicKey = "04f9e999afe15387350b22966e7f37fb175edf8a7c2eddc4596c0f8125514944bb96b889c08881d5741399926016681f5d544f1b28051825413610e5a119229fe6";

  let processor1;
  let invalidProcessor;

  before(async () => {
    EthBDID.connectToIpfs(IPFS_HOST);

    ethServer = ganache.server();
    ethServer.listen(9545);
    rpcProvider = new JsonRpcProvider(RPC_HOST);

    web3 = new Web3(new Web3.providers.HttpProvider(RPC_HOST));
    let accounts = await web3.eth.getAccounts();

    account1 = web3.eth.accounts.create();
    account2 = web3.eth.accounts.create();

    await web3.eth.sendTransaction({
      from: accounts[1],
      to: account1["address"],
      value: '5002465260000000000'
    });

    await web3.eth.sendTransaction({
      from: accounts[1],
      to: account2["address"],
      value: '5002465260000000000'
    });
  });

  describe("Create.", () => {
    it("Should create a new DID", (done) => {
      assert.doesNotThrow(async () => {
        EthBDID.create(account1["privateKey"], account1["address"],
          authPublicKey, rpcProvider).then((did: EthBDID) => {
            this.did = did;
            done();
          }).catch((err: object) => {
            throw new Error(err["err"]);
          });
      });
    })
  });

  describe("Update", () => {
    it("Should set a new controller key", (done) => {
      assert.doesNotThrow(async () => {
        this.did.setController(account2["address"], account1["privateKey"])
          .then(() => {
            done();
          }).catch((err) => {
            throw new Error(err["err"]);
          });
      });
    });

    it("Should set a new authorization key", (done) => {
      assert.doesNotThrow(async () => {
        this.did.setAuthorizationKey(authPublicKey2, account2["privateKey"])
          .then(() => {
            done();
          }).catch((err) => {
            throw new Error(err["err"]);
          });
      });
    })
  });

  /*
  * TODO: Check expired
  */
  describe("Processors", () => {

    before(async () => {
      console.log("Creating a second did...");
      this.did2 = await EthBDID.create(account1["privateKey"], account2["address"], authPublicKey, rpcProvider);
    });

    it("Should authorize new processors", (done) => {
      assert.doesNotThrow(async () => {
        this.processor1 = this.did.authorizeProcessor(processorPublicKey1, true, true, authPrivateKey2);
        this.invalidProcessor = this.did2.authorizeProcessor(invalidProcessorPublicKey, true, true, authPrivateKey);
        done();
      });
    });

    it("Processor should be valid", (done) => {
      assert.doesNotThrow(async () => {
        this.did.verifyProcessor(this.processor1, "auth").then(() => {
          done();
        }).catch((err) => {
          console.log("ERROR:", err);
          throw new Error(err["err"]);
        });
      });
    });

    it("Processor should have an invalid signature", (done) => {
      this.did.verifyProcessor(this.invalidProcessor, "auth").then((result) => {
        expect(result["valid"]).equal(false);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(false);
        done();
      });
    });

    it("Processor should have inadequate permissions", (done) => {
      this.did.verifyProcessor(this.processor1, "delegate").then((result) => {
        expect(result["valid"]).equal(false);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(false);
        done();
      });
    });

    it("Should revoke processor", (done) => {
      assert.doesNotThrow(async () => {
        this.did.revokeProcessorKey(processorPublicKey1, account2["privateKey"]).then((tx) => {
          done();
        }).catch((err) => {
          throw new Error(err["err"]);
        });
      });
    });

    it("Processor should be revoked", (done) => {
      this.did.verifyProcessor(this.processor1, "auth").then((result) => {
        expect(result["valid"]).equal(false);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(false);
        done();
      });
    });
  });

  describe("did-jwt", () => {
    let jwt;
    let invalidJwt;

    let processorJwt;
    let invalidProcessorJwt;

    let claims = { key: "value" };

    before(async () => {
      processorPrivateKey1 = "313dbbe0903399779ee99e04ded8166fe2dd31b801671610592823433db07814";
      processorPublicKey1 = "04d921d5e61a2f0a08a9054604d8608284dcafdc2035f766cc30153aef713035915f24edfe857326551911c6180cc802b35b4b47217221c3e20b34b9fa7d7efccd";

      this.processor1 = this.did.authorizeProcessor(processorPublicKey1, true, true, authPrivateKey2);
    });

    it("Should create a jwt", (done) => {
      assert.doesNotThrow(() => {
        this.jwt = this.did.createJwt(claims, "1 day", authPrivateKey2);
        this.invalidJwt = this.did2.createJwt(claims, "1 day", authPrivateKey);
        done();
      });
    });

    it("Jwt should be valid", (done) => {
      this.did.verifyJwt(this.jwt, "signing").then((result) => {
        expect(result["valid"]).equal(true);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(true);
        done();
      });
    });

    it("Jwt should be invalid", (done) => {
      this.did.verifyJwt(this.invalidJwt, "signing").then((result) => {
        expect(result["valid"]).equal(false);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(false);
        done();
      });
    });

    it("Should create a jwt with processor", (done) => {
      assert.doesNotThrow(() => {
        this.processorJwt = this.processor1.createJwt({ key: "value" }, "1d", processorPrivateKey1);
        this.invalidProcessorJwt = this.invalidProcessor.createJwt({ key: "value" }, "1d", invalidProcessorPrivateKey);
        done();
      });
    });

    it("Jwt created by processor should be valid", (done) => {
      this.did.verifyJwt(this.processorJwt, "signing").then((result) => {
        expect(result["valid"]).equal(true);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(true);
        done();
      });
    });

    it("Jwt created by the wrong processor should be invalid", (done) => {
      this.did.verifyJwt(this.invalidProcessorJwt, "signing").then((result) => {
        expect(result["valid"]).equal(false);
        done();
      }).catch((err) => {
        expect(err["valid"]).equal(false);
        done();
      });
    });

  });

  after(() => {
    ethServer.close();
  });
});
