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
import { FileUpload, TImageType } from "../../components/ui/file-upload";

import MultiSelect from "../../components/ui/MultiSelect";
import { sendImageToBB } from "../../utils/sendImageToBB";
import Loading from "../../components/Loading/Loading";
import { useToastPromise } from "../../hooks/useToastPromise";
import {
  useGetCarByIdQuery,
  useUpdateCarMutation,
} from "../../redux/features/Car/carApi";
import { Image, TCar } from "../../types/global.type";
import { useNavigate, useParams } from "react-router-dom";
import ModifyStatus from "../../components/ModifyStatus/ModifyStatus";

export default function EditCar() {
  const { id } = useParams();

  const { data, isLoading, isSuccess } = useGetCarByIdQuery(id);

  const car = data?.data as TCar;

  // name, carType, description, images, year, pricePerHour, pricePerDay;

  const [carType, setCarType] = useState(car?.carType);
  const navigate = useNavigate();
  const [updateCar] = useUpdateCarMutation();
  const { toastPromise } = useToastPromise();
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<TImageType>([]);

  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]); // State for selected features

  const handleFileUpload = (files: TImageType) => {
    setFiles(files);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setLoading(true);
    let images = [] as Pick<Image, "blurHash" | "url">[];

    if (files.some((file) => file instanceof File)) {
      const generatedLinks = (await sendImageToBB(
        files as (File & { url: string; blurHash: string })[]
      )) as Pick<Image, "blurHash" | "url">[];

      images = generatedLinks;
    } else {
      images = files;
    }

    const carData = {
      ...data,
      images,
      features: selectedFeatures.map((f) => f.value),
    } as TCar;

    const res = (await toastPromise(
      updateCar,
      { data: carData, id: car?._id },
      "Updating car.."
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
  };

  // Available feature options

  const features = [
    "GPS Navigation", // Useful for Adventure/Sports bikes during long rides
    "Mobile Holder with USB Charging", // Common in Scooters and Mileage bikes
    "Bluetooth Connectivity", // Found in premium Cruisers and some Sport bikes
    "Helmet Included", // Standard safety feature across all categories
    "Comfort Seating", // Especially important for Cruisers
    "Disc Brakes", // Common in Sport/Adventure bikes for better performance
    "Fuel Efficient Engine", // Key feature for Mileage Bikes
  ];

  const carFeatures =
    car?.features.map((f: string) => ({
      value: f,
      label: f,
    })) || [];

  const feature = features.map((f: string) => ({
    value: f,
    label: f,
  }));

  const featureOptions = [...carFeatures, ...feature];

  // Handle change in selected features
  const handleFeatureChange = (selectedOptions: any) => {
    setSelectedFeatures(selectedOptions || []);
  };

  useEffect(() => {
    if (isSuccess) {
      setValue("name", car?.name);
      setValue("model", car?.model);
      setValue("year", car?.year);
      setValue("pricePerHour", car?.pricePerHour);
      setValue("pricePerDay", car?.pricePerDay);
      setValue("color", car?.color);
      setValue("description", car?.description);
      setSelectedFeatures(carFeatures);
      setFiles([...car.images]);
      setCarType(car?.carType);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [data]);

  return (
    <div>
      <Helmet>
        <title>Dashboard | Edit Car</title>
      </Helmet>
      {loading || (isLoading && <Loading />)}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Car</CardTitle>
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
                  value={carType}
                  onValueChange={(value) => {
                    setCarType(value);
                    setValue("carType", value, {
                      shouldValidate: true, // This ensures validation runs
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
                  defaultValue={""}
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
            <FileUpload imageUrls={car?.images} onChange={handleFileUpload} />
            {files.length === 0 && (
              <p className="text-red-500 text-sm mt-1 text-center">
                Please upload at-least one image
              </p>
            )}
            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <ModifyStatus
                id={car?._id}
                action={car?.isDeleted ? "recover" : "delete"}
              />
              <Button disabled={files.length === 0} type="submit">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
