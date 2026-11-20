import type { Tagged } from "../../../../../lib/mod.js";
export type TLSMode = Tagged<"HandledExternally"> | Tagged<"WithCertificate", {
    private_key: number[];
    certificate: number[];
}>;
export type AcceptAddress = {
    address: string;
    tls_mode: TLSMode | null;
};
