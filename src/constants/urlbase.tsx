import { serviceUrl } from "../lib/serviceUrl";

const minio = serviceUrl(import.meta.env.VITE_PORT_MINIO)

const urlbase_c = {
    minio,
}

export default urlbase_c;
