import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

const runLiveCredentialTests = process.env.RUN_LIVE_CREDENTIAL_TESTS === "true";

describe("Cloudflare R2 credential", () => {
  it.skipIf(!runLiveCredentialTests)("validates the configured R2 access pair with a read-only bucket listing", async () => {
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    expect(endpoint).toBeTruthy();
    expect(accessKeyId).toBeTruthy();
    expect(secretAccessKey).toBeTruthy();

    const client = new S3Client({
      endpoint,
      region: "auto",
      forcePathStyle: true,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });

    const response = await client.send(new ListBucketsCommand({}));
    expect(Array.isArray(response.Buckets)).toBe(true);
  }, 20_000);
});
