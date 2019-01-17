import KeyEncoder from "key-encoder";
import jwt from "jsonwebtoken";

const JWT_SIG_ALGORITHM = "ES256"; // The only one supported for now
const KEY_ENCODER = new KeyEncoder("secp256k1");
const DOC_TYPE = "ethb-did-processor";


export class Processor {
  private token: string;
  private issuer: string;
  private publicKey: string;
  private permissions: string[];

  constructor(token: string, issuer: string, publicKey: string, permissions: string[]) {
    this.token = token;
    this.issuer = issuer;
    this.publicKey = publicKey;
    this.permissions = permissions;
  }

  public createJwt(claims: object, expiresIn: string, privateKeyHex: string): string {
    claims["algorithm"] = JWT_SIG_ALGORITHM;
    claims["issuer"] = {
      type: "processor",
      processor: this.getToken()
    };
    claims["expiresIn"] = expiresIn;

    let encodedPrivateKey = KEY_ENCODER.encodePrivate(privateKeyHex, "raw", "pem");

    let token = jwt.sign(claims, encodedPrivateKey, { algorithm: 'ES256' });

    return token;
  }

  public getToken(): string {
    return this.token;
  }

  public getIssuer(): string {
    return this.issuer;
  }

  public getPublicKey(): string {
    return this.publicKey;
  }

  public getPermissions(): string[] {
    return this.permissions;
  }

  public static parse(token: string): Processor {
    let decodedToken = jwt.decode(token);

    return new Processor(token, decodedToken["issuer"],
      decodedToken["publicKey"], decodedToken["permissions"]);
  }

  public static createUnauthorized(publicKey: string, auth: boolean, signing: boolean) {
    let permissions = [];
    if (auth)
      permissions.push("auth");
    if (signing)
      permissions.push("signing");

    return { publicKey: publicKey, permissions: permissions, type: DOC_TYPE };
  }

}
