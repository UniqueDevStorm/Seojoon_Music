process.on('unhandledRejection', console.error)
process.on('uncaughtException', console.error)

import SystemClient from "./client";

new SystemClient()