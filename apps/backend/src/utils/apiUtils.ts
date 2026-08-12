import { env } from "@/core/config"
import { IStation, IStationsQueryResponse } from "@/types";
import { ELogType } from "@packages/enum"
import { fetchWithRetry } from "@packages/utils";
import { backend_log } from "@/utils/generalUtils"

// "Bonner Str. 98 (50677 Neustadt/Süd)" >> "Bonner Str. 98"
export const parseStreetFromAddress = (a_Address: string): string => {
    const parenIndex = a_Address.indexOf(" (")
    return parenIndex === -1 ? a_Address.trim() : a_Address.slice(0, parenIndex).trim()
}

// Guards the DB layer from malformed records (missing/wrong-typed fields).
export const isValidStation = (a_Station: IStation): boolean => {
    const objectid = a_Station?.attributes?.objectid
    const adresse = a_Station?.attributes?.adresse
    const x = a_Station?.geometry?.x
    const y = a_Station?.geometry?.y

    return (
        typeof objectid === "number" && Number.isInteger(objectid) &&
        typeof adresse === "string" && adresse.trim().length > 0 &&
        typeof x === "number" && Number.isFinite(x) &&
        typeof y === "number" && Number.isFinite(y)
    )
}

export const useStationsAPI = async (): Promise<IStation[] | undefined> => {
    
    try {

        const resp = await fetchWithRetry(env.stationsApiUrl, undefined, 5, 200);
        if(!resp.ok) {
            throw new Error("Response is not ok!")
        }

        const json = await resp.json() as IStationsQueryResponse

        return json.features

    } catch(error) {
        backend_log(`[useStationsAPI] ${error}`, ELogType.error)
    }


}

