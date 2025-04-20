import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { TCar, TData } from "../../types/global.type";
import { useAppSelector } from "../../redux/hooks";
import { selectLocation } from "../../redux/features/Map/mapSlice";
import { Input } from "../../components/ui/input";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { useForm } from "react-hook-form"; // Import react-hook-form
import { useCreateBookingMutation } from "../../redux/features/Booking/bookingApi";
import { useToastPromise } from "../../hooks/useToastPromise";
import { useNavigate } from "react-router-dom";

type BookingFormData = {
  nidOrPassport: string;
  drivingLicense: string;
  paymentType: "cash" | "stripe" | "aamar pay" | "qr code";
};

type BookingDialogueProps = {
  car: TCar;
  tripDuration: number;
  dialogueOpen: boolean;
  setDialogueOpen: (arg: boolean) => void;
  totalPrice: number;
  selectedFeatures: { label: string; price: number }[];
};

const OTP_LIST = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008];

const BookingDialogue = ({
  car,
  tripDuration,
  dialogueOpen,
  setDialogueOpen,
  totalPrice,
  selectedFeatures,
}: BookingDialogueProps) => {
  const { toastPromise } = useToastPromise();
  const [createBooking] = useCreateBookingMutation();
  const navigate = useNavigate();
  const { tripTime, destinationInfo } = useAppSelector(selectLocation) as { 
    tripTime: [Date, Date];
    destinationInfo: {
      origin: string;
      destination: string;
      distance: string;
      duration: string;
      directionResponse: google.maps.DirectionsResult | null;
    };
  };
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "stripe" | "aamar pay" | "qr code">("cash");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>();

  const paymentOptions = [
    {
      name: "Cash",
      description: "Pay in cash at the time of car pickup",
    },
    {
      name: "Stripe",
      description: "Pay using credit/debit card via Stripe",
    },
    {
      name: "Aamar Pay",
      description: "Pay using credit/debit/bKash/Rocket/Nagad card via Aamar Pay",
    },
    {
      name: "QR Code",
      description: "Scan QR code to make payment using your preferred payment app",
    },
  ];

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method.toLowerCase() as any);
    setShowQRCode(method.toLowerCase() === "qr code");
    setIsPaymentConfirmed(false);
  };

  const handlePaymentConfirmation = () => {
    setIsPaymentConfirmed(true);
  };

  const getRandomOTP = () => {
    const randomIndex = Math.floor(Math.random() * OTP_LIST.length);
    return OTP_LIST[randomIndex];
  };

  const onSubmit = async (data: BookingFormData) => {
    if (selectedPaymentMethod === "qr code" && !isPaymentConfirmed) {
      alert("Please confirm your QR code payment first");
      return;
    }

    const [startDate, endDate] = tripTime;

    const features = selectedFeatures.map((f) => ({
      name: f.label,
      price: f.price,
    }));

    const reservationData = {
      carId: car._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      additionalFeatures: features,
      totalCost: totalPrice,
      origin: destinationInfo.origin,
      destination: destinationInfo.destination,
      completedPayment: selectedPaymentMethod === "qr code" ? true : selectedPaymentMethod !== "cash",
      status: selectedPaymentMethod === "qr code" ? "approved" : "pending",
      otp: getRandomOTP(),
      ...data,
      paymentType: selectedPaymentMethod,
    };

    const res = (await toastPromise(
      createBooking,
      reservationData,
      "Creating a booking..."
    )) as TData<Record<string, unknown>>;

    if (res?.success) {
      setDialogueOpen(false);
      navigate("/dashboard/my-bookings");
    }

    console.log(res);
  };

  return (
    <Dialog open={dialogueOpen} onOpenChange={setDialogueOpen}>
      <DialogContent className="text-white/80 !bg-primary/20 backdrop-blur-md p-6 border !border-primary/40 h-[90vh] flex flex-col">
        <div className="overflow-y-auto flex-1 pr-2">
          <DialogHeader className="text-white/90">
            <DialogTitle className="text-2xl font-bold text-white">
              Confirm Reservation
            </DialogTitle>
            <DialogDescription className="text-sm text-white/70">
              Please review the details of your reservation and provide the
              required personal and payment information.
            </DialogDescription>
          </DialogHeader>

          {/* Displaying Car and Trip Details */}
          <div className="space-y-2 mt-4">
            <p className="font-semibold text-lg">
              Car: {car.name} {car.year} {car.model} {car.carType}
            </p>
            <p className="text-sm text-white/80">
              Trip Duration: {Math.floor(tripDuration / 24)} day(s),{" "}
              {tripDuration % 24} hour(s)
            </p>
            <p className="text-sm text-white/80">
              Origin: {destinationInfo.origin || "N/A"}
            </p>
            <p className="text-sm text-white/80">
              Destination: {destinationInfo.destination || "N/A"}
            </p>
          </div>

          {/* Selected Features */}
          <div className="mt-4">
            <p className="font-semibold text-lg">Selected Additional Features:</p>
            <div className="text-sm space-y-1">
              {!selectedFeatures.length ? (
                <p className="text-white/70">N/A</p>
              ) : (
                selectedFeatures.map((feature) => (
                  <li key={feature.label} className="text-white/80">
                    {feature.label}: ${feature.price}
                  </li>
                ))
              )}
            </div>
          </div>

          {/* Personal Details Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <p className="font-semibold text-lg">Personal Information</p>

            {/* NID/Passport */}
            <Input
              type="text"
              placeholder="NID/Passport"
              {...register("nidOrPassport", {
                required: "NID/Passport is required",
              })}
              className="w-full mt-2 p-2 rounded-md border border-primary/40 bg-white/10 text-white placeholder:text-white/50 focus:border-primary focus:outline-none"
            />
            {errors.nidOrPassport && (
              <p className="text-red-500 text-sm">
                {errors.nidOrPassport.message}
              </p>
            )}

            {/* Driving License */}
            <Input
              type="text"
              placeholder="Driving License"
              {...register("drivingLicense", {
                required: "Driving License is required",
              })}
              className="w-full mt-2 p-2 rounded-md border border-primary/40 bg-white/10 text-white placeholder:text-white/50 focus:border-primary focus:outline-none"
            />
            {errors.drivingLicense && (
              <p className="text-red-500 text-sm">
                {errors.drivingLicense.message}
              </p>
            )}

            {/* Total Cost */}
            <div className="mt-2">
              <p className="font-semibold text-lg">
                Total Cost:{" "}
                <span className="text-2xl text-white font-bold">
                  ${totalPrice}
                </span>
              </p>
            </div>
          </form>
        </div>

        {/* Payment Method and Confirm Button - Fixed at bottom */}
        <div className="mt-4 pt-4 border-t border-primary/40">
          <p className="font-semibold mb-2 text-white">Select Payment Method:</p>
          <RadioGroup
            value={selectedPaymentMethod}
            onChange={handlePaymentMethodChange}
            className="grid grid-cols-2 gap-2"
          >
            {paymentOptions.map((option) => (
              <RadioGroup.Option
                key={option.name}
                value={option.name.toLowerCase()}
                className={({ checked }) =>
                  `group relative flex cursor-pointer rounded-lg bg-white/10 dark:bg-gray-700/50 py-3 px-4 text-white shadow-md transition-all focus:outline-none ${
                    checked
                      ? "border-2 border-primary/50"
                      : "bg-white/5 dark:bg-gray-600/50"
                  }`
                }
              >
                {({ checked }) => (
                  <>
                    <div className="flex w-full items-center justify-between">
                      <div className="text-sm w-11/12">
                        <p className="font-semibold text-white">
                          {option.name}
                        </p>
                        <p className="text-white/70 text-xs">
                          {option.description}
                        </p>
                      </div>
                      <CheckCircleIcon
                        className={`size-5 ${
                          checked ? "opacity-100 text-primary" : "opacity-0"
                        } transition-opacity`}
                      />
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </RadioGroup>

          {/* QR Code Display */}
          {showQRCode && (
            <div className="mt-4 flex flex-col items-center">
              <img 
                src="/qr_code.png" 
                alt="Payment QR Code" 
                className="w-48 h-48 object-contain bg-white p-2 rounded-lg"
              />
              <Button
                variant="outline"
                className="mt-4 bg-white/10 text-white hover:bg-white/20 border-primary/40"
                onClick={handlePaymentConfirmation}
                disabled={isPaymentConfirmed}
              >
                {isPaymentConfirmed ? "Payment Confirmed" : "I have completed the payment"}
              </Button>
            </div>
          )}

          {/* Confirm Button */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              type="submit" 
              onClick={handleSubmit(onSubmit)}
              disabled={selectedPaymentMethod === "qr code" && !isPaymentConfirmed}
              className="bg-white/10 text-white hover:bg-white/20 border-primary/40"
            >
              Confirm Reservation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialogue;
