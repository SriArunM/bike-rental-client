import { Helmet } from "react-helmet-async";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { useEffect, useState } from "react";
import { FileUpload } from "../../components/ui/file-upload";

import MultiSelect from "../../components/ui/MultiSelect";
import { sendImageToBB } from "../../utils/sendImageToBB";
import Loading from "../../components/Loading/Loading";
import { useToastPromise } from "../../hooks/useToastPromise";
import { useAddCarMutation } from "../../redux/features/Car/carApi";
import { TCar } from "../../types/global.type";
import { useNavigate } from "react-router-dom";

export default function AddCar() {
  const navigate = useNavigate();
  const [addCartToDB] = useAddCarMutation();
  const { toastPromise } = useToastPromise();
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<{ url: string; blurHash: string }[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]); // State for selected features

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const carData = {
      ...data,
      features: selectedFeatures.map((f) => f.value),
    } as TCar;

    if (files.length) {
      setLoading(true);

      if (links.length) {
        carData["images"] = links;
      } else {
        const images = (await sendImageToBB(files)) as {
          url: string;
          blurHash: string;
        }[];
        setLinks(images);
        carData["images"] = images;
      }

      const res = (await toastPromise(
        addCartToDB,
        carData,
        "Adding car.."
      )) as { success: boolean };

      if (res.success) {
        navigate("/dashboard/manage-cars");
        setLoading(false);
        reset();
        setFiles([]);
      } else {
        setFiles([]);
        setLoading(false);
      }
    }
  };

  // Available feature options
  const featureOptions = [
    { value: "GPS", label: "GPS Navigation" },
    { value: "Air Conditioning", label: "Mobile Holder with USB Charging" },
    { value: "Automatic Transmission", label: "Bluetooth Connectivity" },
    { value: "Bluetooth", label: "Helmet Included" },
    { value: "Parking Sensors", label: "Comfort Seating" },
    { value: "Heated Seats", label: "Disc Brakes" },
    { value: "Sunroof", label: "Fuel Efficient Engine" },
  ];

  // Handle change in selected features
  const handleFeatureChange = (selectedOptions: any) => {
    setSelectedFeatures(selectedOptions || []);
  };

  useEffect(() => {
    setSelectedFeatures([featureOptions[0]]);
  }, []);

  return (
    <div>
      <Helmet>
        <title>Dashboard | Add Bike</title>
      </Helmet>
      {loading && <Loading />}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Bike</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Car Name and Model (Flex Row) */}
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Car Name */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Bike Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter Bike name"
                  {...register("name", { required: "Bike name is required" })}
                />
                {errors.name?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              {/* Car Model */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Bike Model
                </label>
                <Input
                  type="text"
                  placeholder="Enter bike model"
                  {...register("model", { required: "Car model is required" })}
                />
                {errors.model?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.model.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Car Year and Type (Flex Row) */}
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Car Year */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Year</label>
                <Input
                  type="number"
                  placeholder="Enter year"
                  {...register("year", {
                    required: "Car year is required",
                    min: { value: 2000, message: "Year must be after 2000" },
                    max: {
                      value: new Date().getFullYear(),
                      message: "Year cannot be in the future",
                    },
                  })}
                />
                {errors.year?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.year.message as string}
                  </p>
                )}
              </div>

              {/* Bike Type */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Bike Type
                </label>
                <Select
                  onValueChange={(value) => {
                    setValue("carType", value, {
                      shouldValidate: true, // This ensures validation runs
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Bike Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Scooters</SelectItem>
                    <SelectItem value="SUV">Cruiser Bikes</SelectItem>
                    <SelectItem value="Electric">Mileage Bikes</SelectItem>
                    <SelectItem value="Hybrid">
                      Adventure/Sports Bikes
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.carType?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.carType.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              {/* Price Per Hour */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Price Per Hour
                </label>
                <Input
                  type="number"
                  placeholder="Enter price per hour"
                  {...register("pricePerHour", {
                    required: "Price per hour is required",
                  })}
                />
                {errors.pricePerHour?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pricePerHour.message as string}
                  </p>
                )}
              </div>

              {/* Price Per Day */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Price Per Day
                </label>
                <Input
                  type="number"
                  placeholder="Enter price per day"
                  {...register("pricePerDay", {
                    required: "Price per day is required",
                  })}
                />
                {errors.pricePerDay?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pricePerDay.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              {/* Car Color */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Bike Color
                </label>
                <Input
                  type="text"
                  placeholder="Enter Bike color"
                  {...register("color", {
                    required: "Bike color is required",
                  })}
                />
                {errors.name?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Features
                </label>
                <MultiSelect
                  onChange={handleFeatureChange}
                  options={featureOptions}
                  value={selectedFeatures}
                  placeholder="Select features"
                />
                {selectedFeatures.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Please select at least one feature
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                placeholder="Enter bike description"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters long",
                  },
                })}
              />
              {errors.description?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* File Upload */}
            <FileUpload onChange={handleFileUpload} />
            {files.length === 0 && (
              <p className="text-red-500 text-sm mt-1 text-center">
                Please upload at-least one image
              </p>
            )}
            {/* Submit Button */}
            <div className="text-right">
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark"
              >
                Add Bike
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
