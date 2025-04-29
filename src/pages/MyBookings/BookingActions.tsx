import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "../../components/ui/button";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "./StripePaymentForm";
import axios from "axios";
import { TBooking } from "../../types/global.type";
import {
  useDeleteBookingMutation,
  useModifyBookingMutation,
} from "../../redux/features/Booking/bookingApi";
import { useToastPromise } from "../../hooks/useToastPromise";
import DateTimePicker from "../../components/Searchbar/DateTimePicker";
import { additionalFeatures } from "../CarDetails/CarDetails";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { useAppSelector } from "../../redux/hooks";
import { selectLocation } from "../../redux/features/Map/mapSlice";
import dayjs from "dayjs";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_Stripe_PublishableKey);

type BookingActionsProps = {
  booking: TBooking;
  payment?: boolean;
  manageBookings?: boolean;
};

const BookingActions = ({
  booking,
  payment,
  manageBookings,
}: BookingActionsProps) => {
  const { user } = useUser();
  const { tripTime } = useAppSelector(selectLocation);
  const { toastPromise } = useToastPromise();
  const [cancelBooking] = useDeleteBookingMutation();
  const [modifyBooking] = useModifyBookingMutation();
  const [paymentSecret, setPaymentSecret] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    booking.paymentType || "Cash"
  );
  const [stripeDialogOpen, setStripeDialogOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<
    { label: string; price: number }[]
  >([]);
  const [startDate, endDate] = tripTime;
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl] = useState("");
  const navigate = useNavigate();

  let tripDuration = dayjs(endDate).isAfter(dayjs(startDate))
    ? dayjs(endDate).diff(dayjs(startDate), "hour")
    : 0;

  useEffect(() => {
    if (booking.additionalFeatures) {
      setSelectedFeatures([
        ...booking.additionalFeatures.map((f) => ({
          label: f.name,
          price: f.price,
        })),
      ]);
    }
  }, []);

  useEffect(() => {
    if (tripDuration >= 0) {
      const pricePerDay = booking?.carId?.pricePerDay || 0;
      const pricePerHour = booking?.carId?.pricePerHour || 0;

      const basePrice =
        tripDuration >= 24
          ? Math.ceil(tripDuration / 24) * Number(pricePerDay)
          : tripDuration * Number(pricePerHour);

      const featuresPrice = selectedFeatures.reduce((total, feature) => {
        const featureItem = additionalFeatures.find(
          (item) => item.label === feature.label
        );
        return (
          total +
          (featureItem
            ? featureItem.price *
              (tripDuration >= 24 ? Math.ceil(tripDuration / 24) : tripDuration)
            : 0)
        );
      }, 0);

      setTotalPrice(basePrice + featuresPrice);
    }
  }, [tripDuration, selectedFeatures]);

  const paymentOptions = [
    {
      name: "Google Pay",
      description: "Scan QR code to make payment using Google Pay.",
    },
    {
      name: "Cash",
      description: "Pay in cash at the time of pickup, needs admin confirmation.",
    }
  ];

  const handlePaymentSelection = (value: "Google Pay" | "cash") => {
    setSelectedPaymentMethod(value);
  };

  const handleConfirmPayment = async (cost: number) => {
    setPaymentSecret("");
    setDisableButton(true);
    
    if (selectedPaymentMethod === "cash") {
      // Update booking with cash payment details
      const { carId, _id, ...rest } = booking;
      const bookingData = { ...rest };
      bookingData.paymentType = "cash";
      bookingData.completedPayment = false; // Cash payments need admin confirmation

      await toastPromise(
        modifyBooking,
        { data: bookingData, id: _id },
        "Updating booking with cash payment...",
        "Booking updated!"
      );

      setPaymentOpen(false);
    } else if (selectedPaymentMethod === "Google Pay") {
      // Show QR code dialog
      setQrDialogOpen(true);
    }
  };

  const handleModifyBooking = () => {
    const data = {
      additionalFeatures: selectedFeatures.map((f) => ({
        name: f.label,
        price: f.price,
      })),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalCost: totalPrice,
    };
    const res = toastPromise(
      modifyBooking,
      { data, id: booking._id },
      "Saving changes..."
    );
    console.log(res);
    setModifyDialogOpen(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    await toastPromise(
      cancelBooking,
      bookingId,
      "Cancelling the booking for you..."
    );
  };

  const toggleFeature = (feature: { label: string; price: number }) => {
    if (selectedFeatures.find((f) => f.label === feature.label)) {
      setSelectedFeatures(
        selectedFeatures.filter((item) => item.label !== feature.label)
      );
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handlePrintInvoice = () => {
    setPrintDialogOpen(true);
  };

  const printInvoice = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const downloadInvoiceAsPDF = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  return (
    <>
      <div
        onClick={() => setShowDatePicker(false)}
        className={`${
          !payment && !manageBookings && "mt-4"
        } flex justify-end items-center space-x-4 `}
      >
        {booking.status === "rejected" && !manageBookings ? (
          <h1 className="bg-primary text-white p-2 rounded-xl uppercase">
            Booking has been rejected
          </h1>
        ) : (
          <>
            {!manageBookings && !payment && (
              <>
                {/* Modify Button */}
                <Button
                  disabled={booking.status !== "pending"}
                  className=""
                  onClick={() => setModifyDialogOpen(true)}
                >
                  Modify
                </Button>

                {/* Cancel Button */}
                <Button
                  disabled={booking.status !== "pending"}
                  className=" font-semibold shadow-lg !bg-primary !text-white"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel
                </Button>
              </>
            )}

            {/* Payment Button (only if approved) */}
            {!manageBookings &&
              booking.status === "approved" &&
              !booking.completedPayment && (
                <Button onClick={() => setPaymentOpen(true)}>
                  Make Payment
                </Button>
              )}
            <Button
              onClick={handlePrintInvoice}
              className="text-foreground text-2xl"
            >
              <LiaFileInvoiceSolid />
            </Button>
          </>
        )}
      </div>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 text-black dark:text-white rounded-xl shadow-lg p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900 dark:text-white font-bold">
              Payment for {booking.carId.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              <strong>Total Amount:</strong> ${booking.totalCost}
            </p>

            {/* Payment Method Selection */}
            <div className="mt-6">
              <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Select Payment Method:
              </p>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handlePaymentSelection}
                className="space-y-2"
              >
                {paymentOptions.map((option) => (
                  <RadioGroup.Option
                    key={option.name}
                    value={option.name}
                    className={({ checked }) =>
                      `group relative flex cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-4 px-5 text-gray-700 dark:text-gray-200 shadow-md transition-all focus:outline-none ${
                        checked
                          ? "border-2 border-primary/50"
                          : "bg-gray-100 dark:bg-gray-600"
                      }`
                    }
                  >
                    {({ checked }) => (
                      <>
                        <div className="flex w-full items-center justify-between">
                          <div className="text-sm w-11/12">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {option.name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
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
            </div>

            {/* Confirm Payment Button */}
            <div className="mt-6">
              <Button
                disabled={selectedPaymentMethod === "cash" || disableButton}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  selectedPaymentMethod === "cash"
                    ? "bg-gray-500 dark:bg-gray-600 cursor-not-allowed"
                    : "transition-all"
                }`}
                onClick={() => handleConfirmPayment(booking.totalCost)}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Dialog */}
      <Dialog open={stripeDialogOpen} onOpenChange={setStripeDialogOpen}>
        <DialogContent className="!bg-white p-8 rounded-lg shadow-lg max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stripe Payment</DialogTitle>
          </DialogHeader>
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: paymentSecret }}
          >
            <StripePaymentForm
              booking={booking}
              setStripeDialogOpen={setStripeDialogOpen}
              setPaymentOpen={setPaymentOpen}
            />
          </Elements>
        </DialogContent>
      </Dialog>

      {/* QR Code Payment Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="!bg-white p-8 rounded-lg shadow-lg max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Google Pay Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <img 
                src="/gpay-qr.png" 
                alt="Google Pay QR Code" 
                className="w-64 h-64"
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Amount to Pay: ${booking.totalCost}</p>
              <p className="text-sm text-gray-600">Scan QR code with Google Pay app</p>
              <p className="text-sm text-gray-600">Payment will be verified automatically</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm font-medium">Payment Status:</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Waiting for payment...</span>
              </div>
            </div>
            <Button
              onClick={() => {
                // Here you would typically verify the payment status
                // For demo, we'll just close the dialog after 5 seconds
                setTimeout(() => {
                  setQrDialogOpen(false);
                  setPaymentOpen(false);
                  navigate("/dashboard/payments", { state: "recent" });
                }, 5000);
              }}
              className="mt-4"
            >
              I've Made the Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 text-black dark:text-white rounded-xl shadow-lg p-8">
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              onClick={() => setCancelDialogOpen(false)}
              className="bg-gray-300 hover:bg-gray-400 text-black"
            >
              No, Keep Booking
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                handleCancelBooking(booking._id);
                setCancelDialogOpen(false);
              }}
            >
              Yes, Cancel Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modify Booking Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent
          onClick={() => setShowDatePicker(false)}
          className="backdrop-blur-lg bg-gray-900/90  text-white rounded-xl shadow-lg p-8"
        >
          <DialogHeader>
            <DialogTitle>Modify Booking</DialogTitle>
          </DialogHeader>

          <DateTimePicker
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            dates={[new Date(booking.startDate), new Date(booking.endDate)]}
          />
          <div>
            <p className="text-lg font-semibold mb-1">Additional Features</p>
            <div className="flex flex-wrap gap-4">
              {additionalFeatures.map((feature) => (
                <motion.div
                  layout
                  key={feature.label}
                  onClick={() => toggleFeature(feature)}
                  className={`${
                    selectedFeatures.find((f) => f.label === feature.label)
                      ? "bg-primary text-white"
                      : "bg-background text-foreground/80"
                  } font-thin uppercase relative cursor-pointer flex items-center justify-between px-4 py-2 rounded-md shadow transition-colors duration-200`}
                >
                  <span>
                    {feature.label} ${feature.price}
                  </span>

                  <AnimatePresence>
                    {selectedFeatures.find(
                      (f) => f.label === feature.label
                    ) && (
                      <motion.span>
                        <FaCheckCircle className="text-foreground ml-2" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold">Pricing</p>
            <span className="text-2xl font-bold text-white">${totalPrice}</span>
            <p className="text-sm text-white/80">
              Based on {Math.floor(tripDuration / 24)} day(s) and{" "}
              {tripDuration % 24} hour(s) of trip duration and selected
              features.
            </p>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleModifyBooking}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="overflow-y-auto max-h-screen">
          {/* Styled Invoice Format */}
          <div ref={printRef} className="text-foreground ">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Booking Invoice</h2>
              <p className="text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <p>
                <strong>Booking ID:</strong> {booking._id}
              </p>
              <p>
                <strong>Bike:</strong> {booking.carId.name} (
                {booking.carId.model} - {booking.carId.year})
              </p>
              <p>
                <strong>Origin:</strong> {booking.origin}
              </p>
              <p>
                <strong>Destination:</strong> {booking.destination}
              </p>
              <p>
                <strong>Start Date:</strong>{" "}
                {new Date(booking.startDate).toLocaleString()}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {new Date(booking.endDate).toLocaleString()}
              </p>
              <p>
                <strong>OTP:</strong> {booking.otp || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span
                  className={`${
                    booking.completedPayment ? "text-green-600" : "text-red-600"
                  } font-bold`}
                >
                  {booking.completedPayment ? "Completed" : "Pending"}
                </span>
              </p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {booking.paymentType === "cash" ? "Cash" : "Stripe"}
              </p>
              {booking.paymentId && (
                <p>
                  <strong>Payment ID:</strong> {booking.paymentId}
                </p>
              )}
              <p>
                <strong>Total Cost:</strong> ${totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Additional Features</h3>
              <ul className="list-disc ml-5">
                {booking.additionalFeatures.length > 0 ? (
                  booking.additionalFeatures.map((feature) => (
                    <li key={feature.name}>
                      {feature.name}: ${feature.price}
                    </li>
                  ))
                ) : (
                  <li>No additional features selected</li>
                )}
              </ul>
            </div>

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <p className="font-bold text-lg">Total Cost</p>
              <p className="text-xl font-semibold">${totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <Button onClick={printInvoice}>Print Invoice</Button>
            <Button onClick={downloadInvoiceAsPDF}>Download PDF</Button>
            <Button
              onClick={() => setPrintDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingActions;
