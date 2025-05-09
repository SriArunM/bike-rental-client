import { BaseQueryApi } from "@reduxjs/toolkit/query";
import { TUser } from "../redux/features/auth/authSlice";

export type TMeta = {
  total: number;
  pageNumber: number;
  limitDataCount: number;
  totalPage: number;
};

export type TError = {
  data: {
    message: string;
    stack: string;
    success: boolean;
  };
  message: string;
  status: number;
};

export type TData<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data: T;
};

export type TResponseRedux<T> = TData<T> & BaseQueryApi;

export type TResponse<T> = {
  data?: TData<T>;
  error?: TError;
};

export type TCar = {
  _id: string;
  name: string;
  carType: string;
  model: string;
  year: string;
  description: string;
  color: string;
  images: Image[];
  features: string[];
  pricePerHour: string;
  pricePerDay: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  availableForTheDateEntered?: string;

  __v: number;
};

export type Image = {
  url: string;
  blurHash: string;
  _id?: string;
};

export type TUrlQueryParams = { carBrand?: string; carType?: string; priceRange?: string; startDate: string; endDate: string, page: number }


export type TQueryParams = { name: string; value: string | boolean | number }[];

export type TPaymentType = "Google Pay" | "cash" | "stripe" | "Aamar Pay" | "razorpay";

export type TBooking = {
  _id: string;
  user: TUser | string;
  carId: TCar;
  origin: string;
  destination: string;
  drivingLicense: string;
  nidOrPassport: string;
  startDate: string | Date;
  endDate: string | Date;
  totalCost: number;
  additionalFeatures: { name: string; price: number }[];
  paymentType: TPaymentType;
  paymentId: string;
  completedPayment: boolean;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected" | "completed";
  otp: number;
  __v: number;
};