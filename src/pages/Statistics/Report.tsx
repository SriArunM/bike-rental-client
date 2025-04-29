import { useRef } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../components/ui/dialog";

type ReportProps = {
  data: any;
};

const Report = ({ data }: ReportProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const printDashboardReport = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const downloadDashboardReport = () => {
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
    <Dialog>
      <DialogTrigger>
        <Button>Report</Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto max-h-screen">
        <div>
          {/* The printable report content */}
          <div ref={printRef} className="text-foreground">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Dashboard Summary</h2>
              <p className="text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col md:flex-row">
              <div>
                {/* User Statistics */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">User Statistics</h3>
                  <p>
                    <strong>Total Users:</strong> {data.totalUsers}
                  </p>
                  <p>
                    <strong>Active Users:</strong> {data.activeUsers}
                  </p>
                  <p>
                    <strong>Blocked Users:</strong> {data.blockedUsers}
                  </p>
                </div>

                {/* Booking Statistics */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Booking Statistics</h3>
                  <p>
                    <strong>Total Bookings:</strong> {data.totalBookings}
                  </p>
                  <p>
                    <strong>Pending Bookings:</strong> {data.pendingBookings}
                  </p>
                  <p>
                    <strong>Approved Bookings:</strong> {data.approvedBookings}
                  </p>
                  <p>
                    <strong>Completed Bookings:</strong>{" "}
                    {data.completedBookings}
                  </p>
                  <p>
                    <strong>Average Booking Duration:</strong>{" "}
                    {data.avgBookingDuration.toFixed(2)} days
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Revenue Details</h3>
                  <p>
                    <strong>Total Revenue:</strong> $
                    {data.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Payment Methods</h3>
                  {data.paymentMethods.map(
                    (method: { _id: string; count: number }) => (
                      <p key={method._id}>
                        <strong>{method._id}:</strong> {method.count} payments
                      </p>
                    )
                  )}
                </div>
              </div>

              <div>
                {/* Most Rented Cars */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Most Rented Bikes</h3>
                  {data.mostRentedCars.map(
                    (car: {
                      _id: string;
                      count: number;
                      carName: string;
                      carModel: string;
                      carType: string;
                    }) => (
                      <p key={car._id}>
                        <strong>
                          {car.carName} {car.carModel} ({car.carType}):
                        </strong>{" "}
                        Rented {car.count} times
                      </p>
                    )
                  )}
                </div>

                {/* Available Cars */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Available Cars</h3>
                  <p>
                    <strong>Total Available Cars:</strong> {data.availableCars}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <Button onClick={printDashboardReport}>Print Report</Button>
            <Button onClick={downloadDashboardReport}>Download PDF</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Report;
