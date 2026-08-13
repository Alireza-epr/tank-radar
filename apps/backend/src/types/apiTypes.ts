export interface IStation {
  attributes: {
    objectid: number;
    adresse: string;
  };
  geometry: {
    x: number;
    y: number;
  };
}

export interface IStationsQueryResponse {
  displayFieldName: string;
  fieldAliases: Record<string, string>;
  geometryType: string;
  spatialReference: {
    wkid: number;
    latestWkid: number;
  };
  fields: {
    name: string;
    type: string;
    alias: string;
    length?: number;
  }[];
  features: IStation[];
}
