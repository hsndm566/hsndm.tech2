# Railway Migration TODO

- [ ] Capture independent before-state evidence for the static `hsndm.tech` Railway service and the separate `autoapply-sa` automation service.
- [ ] Repoint only Railway service `d6c650aa-f752-4efa-a6fc-03ecc442858d` from `hsndm566/hsndm.tech` to `hsndm566/hsndm.tech2`.
- [ ] Verify the migrated service source, deployment logs, `/healthz`, and tRPC route response.
- [ ] Verify the `autoapply-sa` service source, deployment, generated hostname, and `/healthz` endpoint are unchanged.
- [ ] Document any remaining custom-domain dependency before modifying DNS.
