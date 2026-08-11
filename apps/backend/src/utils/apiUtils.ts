import { env } from "@/core/config"
import { IStation, IStationsQueryResponse } from "@/types";
import { ELogType } from "@packages/enum"
import { fetchWithRetry } from "@packages/utils";
import { backend_log } from "@/utils/generalUtils"

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

