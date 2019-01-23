import { Wallet, ContractFactory, Contract } from "ethers";
import { Provider } from "ethers/providers";
import { IPFSRevocationList } from "./ipfs-revocation-list";
import { AuthorizationKey } from "./authorization-key";
import { Processor } from "./processor";
/*if (version !== undefined) { comment this out in index.js
  var message = 'More than one instance of bitcore-lib found. ' +
    'Please make sure to require bitcore-lib and check that submodules do' +
    ' not also include their own bitcore-lib dependency.';
  throw new Error(message);
}*/

import IPFSApi from "ipfs-api";
import jwt from "jsonwebtoken";
import KeyEncoder from "key-encoder";
import EthCrypto from "eth-crypto";
import fs from "fs";
import path from "path";
import Util from "util";
import URL from "url";


const DID_PATH = "did:ethb:%s";
const JWT_SIG_ALGORITHM = "ES256"; // The only one supported for now
const KEY_ENCODER = new KeyEncoder("secp256k1");

export class EthBDID {
  public static ipfsApi: IPFSApi;

  private didUri: string;
  private controller: string;
  private authKey: AuthorizationKey;
  private revocationList: IPFSRevocationList;
  private provider: Provider;

  constructor(didUri: string, controller: string, authKeyAddress: string,
    revocationAddress: string, provider: Provider) {
    this.didUri = didUri;
    this.controller = controller;
    this.authKey = new AuthorizationKey(authKeyAddress);
    this.revocationList = new IPFSRevocationList(revocationAddress);
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
  public setController(controllerAddress: string, privateKey: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let abi = EthBDID.getAbi();

        let wallet = new Wallet(privateKey, this.provider);

        // load the contract
        let contractAddress = URL.parse(this.didUri).pathname.substring(2);
        let contract = new Contract(contractAddress, abi, wallet);
        // Update the smart contract
        let transaction = await contract.setController(controllerAddress);
        // Set locally
        this.controller = controllerAddress;
        onSuccess(transaction);
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Sets a new authorization key to the did.
  *
  * @param {string} authorizationKey The new authorization Ethereum address.
  * @param {string} privateKey The private key of the current controller address.
  *
  * @return {Promise<object>} The transaction info.
  */
  public setAuthorizationKey(authKeyHex: string, privateKey: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let bytecode = EthBDID.getBytecode();
        let abi = EthBDID.getAbi();

        let wallet = new Wallet(privateKey, this.provider);

        // load the contract
        let contractAddress = URL.parse(this.didUri).pathname.substring(2);
        let contract = new Contract(contractAddress, abi, wallet);

        // Write the authkey to ipfs
        let authKey = new AuthorizationKey();
        let authKeyAddress = await authKey.create(authKeyHex);

        // Update the smart contract
        let transaction = await contract.setAuthorizationKey(authKeyAddress);

        // Set locally
        this.authKey = authKey;

        onSuccess(transaction);
      } catch (err) {
        onError(err);
      }
    });
  }


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
  public authorizeProcessor(publicKey: string, auth: boolean, signing: boolean, authPrivateKey: string): Processor {
    let unauthorizedProcessor = Processor.createUnauthorized(publicKey, auth, signing);
    let authorizedProcessorToken = this.createJwt(unauthorizedProcessor, null, authPrivateKey);
    let authorizedProcessor = Processor.parse(authorizedProcessorToken);

    return authorizedProcessor;
  }

  /*
  * Revoke a processor key.
  *
  * @param {string} processorKey The processor public key.
  * @param {string} privateKey The private key of the current controller address.
  *
  * @return {Promise<object>} The transaction info.
  */
  public revokeProcessorKey(processorKey: string, privateKey: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let revocationAddress = await this.revocationList.revokeProcessorKey(processorKey);

        if (revocationAddress == null) {
          // No changes needed
          onSuccess(null);
        } else {
          let abi = EthBDID.getAbi();

          let wallet = new Wallet(privateKey, this.provider);

          // load the contract
          let contractAddress = URL.parse(this.didUri).pathname.substring(2);
          let contract = new Contract(contractAddress, abi, wallet);

          let transaction = await contract.setRevocationAddress(revocationAddress);
          onSuccess(transaction);
        }
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Create a jwt web token.
  *
  * @param {object} Claims The claims to be signed.
  * @param {string} expiresIn A string describing a time span.
  * @param {string} privateKeyHex The authorization private key.
  *
  * @return {string} The json web token.
  */
  public createJwt(claims: object, expiresIn: string, privateKeyHex: string): string {
    claims["algorithm"] = JWT_SIG_ALGORITHM;
    claims["issuer"] = {
      type: "controller",
      did: this.didUri
    };
    claims["expiresIn"] = expiresIn;

    let encodedPrivateKey = KEY_ENCODER.encodePrivate(privateKeyHex, "raw", "pem");

    let token = jwt.sign(claims, encodedPrivateKey, { algorithm: 'ES256' });

    return token;
  }

  /*
  * Verifies a EthBDID jwt.
  *
  * @param {string} token The json web token.
  * @param {string} permission The requested permission.
  *
  * @return {object} The verification result.
  */
  public verifyJwt(token: string, permission: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        // Parse the string token into an object
        let decodedToken = jwt.decode(token);

        if (!("issuer" in decodedToken))
          throw new Error("Invalid jwt format. Issuer field is missing.");

        let issuer = decodedToken["issuer"];

        let issuerDIDUri: string;
        let publicKeyHex: string;

        // Get the controller did and public key
        if (issuer["type"] == "controller") {
          // 1) Get the issuer did
          issuerDIDUri = issuer["did"];

          // 2) Get the public key
          let authKey = await this.authKey.load();
          publicKeyHex = authKey.getPublicKey();

        } else if (issuer["type"] == "processor") {
          // Verify the processor

          let processor = Processor.parse(issuer["processor"]);
          await this.verifyProcessor(processor, permission);

          // 1) Get the issuer did
          issuerDIDUri = processor.getIssuer()["did"];

          // 2) Get the public key
          publicKeyHex = processor.getPublicKey();

        } else {
          throw new Error("Invalid jwt. Issuer field is invalid.");
        }

        // 1) Check the issuer did
        if (issuerDIDUri != this.didUri)
          throw new Error("Wrong issuer DID.");

        let decodedPublicKey = KEY_ENCODER.encodePublic(publicKeyHex, "raw", "pem");

        // 2) Verify the signature
        jwt.verify(token, decodedPublicKey, { algorithm: JWT_SIG_ALGORITHM }, (err: any) => {
          if (err) {
            onError({ valid: false, err: err });
          } else {
            onSuccess({ valid: true });
          }
        });
      } catch (err) {
        onError({ valid: false, err: err });
      }
    });
  }

  /*
  * Verify wether a processor is valid.
  *
  * @param {Processor} processor The processor.
  * @param {string} permission What permission it's requesting to use.
  *
  * @return {object} The verification result.
  */
  public verifyProcessor(processor: Processor, permission: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        // 1) Check that the issuer is a controller
        let issuer = processor.getIssuer();

        if (issuer["type"] != "controller")
          throw new Error("Invalid issuer! The issuer needs to be a controller.");

        // 2) Verify the JWT
        let jwtVerified = await this.verifyJwt(processor.getToken(), permission);

        if (!jwtVerified["valid"])
          throw new Error(jwtVerified["err"]);

        // 3) Check permissions
        if (processor.getPermissions().indexOf(permission) == -1)
          throw new Error("This processor does not have adequate permissions.");

        // 4) Check if revoked

        if (await this.revocationList.isProcessorRevoked(processor))
          throw new Error("Processor is revoked");;

        // 5) Check the controller did

        onSuccess({ valid: true });
      } catch (err) {
        onError({ valid: false, err: err });
      }
    });

  }

  public getUri(): string {
    return this.didUri;
  }

  public getController(): string {
    return this.controller;
  }

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
  public static create(privateKey: string, controller: string,
    authKeyHex: string, provider: Provider): Promise<EthBDID> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let bytecode = EthBDID.getBytecode();
        let abi = EthBDID.getAbi();

        let wallet = new Wallet(privateKey, provider);

        // Create the did contract
        let contractFactory = new ContractFactory(abi, bytecode, wallet);

        // Write the authkey to ipfs
        let authKey = new AuthorizationKey();
        let authKeyAddress = await authKey.create(authKeyHex);

        // Deploy the contract to the network
        let contract = await contractFactory.deploy(controller, authKeyAddress);
        let didUri = Util.format(DID_PATH, contract.address);

        onSuccess(new EthBDID(didUri, controller, authKeyAddress, null, provider));
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Resolve a did from the network.
  *
  * @param {string} didUri The uri of the did e.g did:ethb:0xbB6270A80031eeB0BAb7aa2E2e3bd60164427886.
  * @param {Provider} provider The Ethereum provider.
  */
  public static resolve(didUri: string, provider: Provider): Promise<EthBDID> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let bytecode = EthBDID.getBytecode();
        let abi = EthBDID.getAbi();

        // Fetch the contract
        let contractAddress = URL.parse(didUri).pathname.substring(2);
        let contract = new Contract(contractAddress, abi, provider);

        let didValues = await EthBDID.readDidContractValues(contract);
        let did = new EthBDID(didUri, didValues["controller"], didValues["authorizationKey"],
          didValues["revocationAddress"], provider);
        onSuccess(did);
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Connect to an ipfs node.
  *
  * @param {string} apiUrl The api url if the ipfs node.
  */
  public static connectToIpfs(apiUrl: string): void {
    if (EthBDID.ipfsApi == undefined)
      EthBDID.ipfsApi = IPFSApi(apiUrl);
  }

  /*
  * The private functions.
  */

  private static readDidContractValues(contract: Contract): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let controllerKey = await contract.getController();
        let authorizationKey = await contract.getAuthorizationKey();
        let revocationAddress = await contract.getRevocationAddress();

        onSuccess({
          controller: controllerKey,
          authorizationKey: authorizationKey,
          revocationAddress: revocationAddress
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  private static getBytecode(): string {
    let bytecode = JSON.parse(fs.readFileSync(path.join(__dirname, "./contract/bytecode.json")).toString());
    return "0x" + bytecode["object"];
  }

  private static getAbi(): Array<string | any> {
    let abi = JSON.parse(fs.readFileSync(path.join(__dirname, "./contract/abi.json")).toString());
    return abi;
  }
}
