/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  DefinitionType,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, signIn } from "../features/auth/authSlice";

const baseUrl = import.meta.env.VITE_BASE_URL;
console.log('API Base URL:', baseUrl);

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    console.log('Current auth token:', token);

    if (token) {
      const tokenWithBearer = `Bearer ${token}`;
      headers.set("authorization", tokenWithBearer);
    }

    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  console.log('Making API request:', args);
  let result = await baseQuery(args, api, extraOptions);
  console.log('API response:', result);

  if (result?.error?.status === 401) {
    console.log('Token expired, attempting refresh');
    const res = await fetch(`${baseUrl}/auth/refreshToken`, {
      method: "POST",
      credentials: "include",
    });

    const { data } = await res.json();
    console.log('Refresh token response:', data);

    const user = (api.getState() as RootState).auth.user;
    const accessToken = data?.accessToken;

    if (accessToken) {
      api.dispatch(signIn({ user, token: accessToken }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: ["cars", "users", "bookings", "deletedCars", "stats", "isExists"],
  endpoints: () => ({}),
});