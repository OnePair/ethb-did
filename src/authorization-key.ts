import { EthBDID } from "./ethb-did";

import Util from "util";

export class AuthorizationKey {
  public static TYPE: string = "secp256k1";
  private publicKey: string;
  private address: string;

  constructor(address?: string) {
    this.address = address;
  }

  public getPublicKey(): string {
    return this.publicKey;
  }

  public getAddress(): string {
    return this.address;
  }

  public create(publicKey: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let publicKeyObject = {
          type: AuthorizationKey.TYPE,
          publicKey: publicKey
        };

        let buffer = Buffer.from(JSON.stringify(publicKeyObject));
        EthBDID.ipfsApi.add(buffer, (err, fileInfo: object) => {
          if (err) {
            onError(err)
          } else {
            this.address = fileInfo[0]["hash"];

            // Pin to the node
            EthBDID.ipfsApi.pin.add(this.address, () => {
              onSuccess(this.address);
            });
          }
        });
      } catch (err) {
        onError(err);
      }
    });
  }

  public load(): Promise<AuthorizationKey> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      let keyUrl = Util.format("/ipfs/%s", this.address);
      EthBDID.ipfsApi.cat(keyUrl, (err, file) => {
        if (err) {
          onError(err);
        } else {
          let publicKeyObject = JSON.parse(file.toString());
          this.publicKey = publicKeyObject["publicKey"];
          onSuccess(this);
        }
      });
    });
  }

}
