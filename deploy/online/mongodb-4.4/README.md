# MongoDB 4.4

Set these values together in `.env.vps` (also the Compose defaults):

```dotenv
MONGO_VERSION=4.4.29
MONGO_DEPLOY_DIR=mongodb-4.4
MONGO_SHELL=mongo
```

This directory contains health, replica initialization and application-user scripts for the legacy `mongo` shell. Credentials are read with `_getEnv`. Copy this directory with the shared deployment files described in [the deployment guide](../README.md).

Existing standalone databases can initialize `rs0` on their existing volume after a backup. Keep the existing administrator credentials and Compose project/volume mapping.
