import axios, { AxiosInstance } from "axios"
import { BASE_URL, EXTERNAL_API_URL, INTERNAL_API_URL } from "./const"

export const createAPI = (baseURL = BASE_URL): AxiosInstance => {
  return axios.create({
    baseURL:baseURL,
    headers: { "Content-Type": "application/json" },
  })
}

export const internalApi = createAPI(INTERNAL_API_URL)

export const externalApi = createAPI(EXTERNAL_API_URL)