export const EBaseRoute = {
    api: "/v1/api"
} as const

export const ERoutes = {
    health : EBaseRoute.api + "/health"
} as const