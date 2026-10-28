# MongoDB 8.0 and later

Set these values together in `.env.vps`:

```dotenv
MONGO_VERSION=8.0.5
MONGO_DEPLOY_DIR=mongodb-8.0
MONGO_SHELL=mongosh
```

This directory uses `mongosh`, `process.env` and `hello`. Copy this directory with the shared deployment files described in [the deployment guide](../README.md). Test the chosen image tag before deploying a newer version; compatibility with every future release is not guaranteed.

These scripts initialize a replica set and provision users; they do not upgrade database files or FCV. Do not attach a MongoDB 4.4 data volume directly to MongoDB 8.0.
