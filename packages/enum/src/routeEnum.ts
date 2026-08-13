export const EBaseRoute = {
    api: "/v1/api"
} as const

export const ERoutes = {
    health : EBaseRoute.api + "/health",
    sync : EBaseRoute.api + "/sync",
    syncMeta : EBaseRoute.api + "/sync/meta",
    stations : EBaseRoute.api + "/stations"
} as const