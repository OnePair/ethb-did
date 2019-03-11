import { EthBDID } from "./ethb-did";
import { Processor } from "./processor";

import Util from "util";
import Crypto from "crypto";

// Revocation list for the processor keys
export class IPFSRevocationList {
  private address: string; // The ipfs address

  constructor(address: string) {
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
  public revokeProcessorKey(processorKey: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let keyHash = Crypto.createHash("sha256")
          .update(processorKey)
          .digest("hex");

        let revocationObject = await this.getRevocationList();
        let revokedProcessorKeys = revocationObject["processorKeys"];

        if (revokedProcessorKeys.indexOf(keyHash) == -1) {
          revokedProcessorKeys.push(keyHash);
          let address = await this.updateRevocationList(revokedProcessorKeys);
          onSuccess(address);
        } else {
          onSuccess(null);
        }
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Check if a processor key has been revoked.
  *
  * @param {Processor} processor The processor.
  *
  * @param {Promise<boolean>} The revocation result.
  */
  public isProcessorRevoked(processor: Processor): Promise<boolean> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let keyHash = Crypto.createHash("sha256")
          .update(processor.getPublicKey())
          .digest("hex");

        let revocationObject = await this.getRevocationList();
        let revokedProcessorKeys = revocationObject["processorKeys"];

        // Check if the processor key is in the list of revoked keys
        if (revokedProcessorKeys.indexOf(keyHash) == -1) {
          onSuccess(false);
        } else {
          onSuccess(true);
        }
      } catch (err) {
        onError(err);
      }
    });
  }

  public getAddress(): string {
    return this.address;
  }

  /*
  * Private functions.
  */

  private getRevocationList(): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        // If none exists
        if (this.address == undefined || this.address == null || this.address.length == 0) {
          onSuccess({ "processorKeys": [] });
        } else {
          // Get the revocation object from ipfs
          let revocationUrl = Util.format("/ipfs/%s", this.address);
          EthBDID.ipfsApi.cat(revocationUrl, (err, file) => {
            if (err) {
              onError(err);
            } else {
              let revocationObject = JSON.parse(file.toString());
              onSuccess(revocationObject);
            }
          });
        }
      } catch (err) {
        onError(err);
      }
    });
  }

  private updateRevocationList(processorKeys: Array<string>): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let revocationObject = { "processorKeys": processorKeys };
        let buffer = Buffer.from(JSON.stringify(revocationObject));

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


}
