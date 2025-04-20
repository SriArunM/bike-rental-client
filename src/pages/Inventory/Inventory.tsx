import { Helmet } from "react-helmet-async";
import SearchBar from "../../components/Searchbar/Searchbar";
import { useGetAllCarsQuery } from "../../redux/features/Car/carApi";
import useSearchQuery from "../../hooks/useSearchQuery";

import { Paginate } from "../../components/Pagination/Pagination";

import CarCardSkeleton from "../../components/Skeleton/CarCardSkeleton";
import CarCard from "../../components/Card/CarCard";

export default function Inventory() {
  const {
    carType,
    carBrand,
    priceRange,

    setPage,
    setCarBrand,
    setCarType,
    startFetching,
    setPriceRange,
    handleClear,
    query,
    showDatePicker,
    setShowDatePicker,
  } = useSearchQuery();

  const { data, isLoading, isError } = useGetAllCarsQuery(query, {
    skip: startFetching,
  });
  const cars = data?.data;
  const meta = data?.meta;

  return (
    <div
      onClick={() => setShowDatePicker(false)}
      className="container mx-auto px-4 md:px-6 py-8 text-foreground"
    >
      <Helmet>
        <title>BikeRental | Inventory</title>
      </Helmet>
      <div className="flex flex-col items-center w-full gap-5">
        <div className="space-y-4 w-full max-w-4xl">
          <SearchBar
            carType={carType}
            carBrand={carBrand}
            priceRange={priceRange}
            setCarBrand={setCarBrand}
            setCarType={setCarType}
            setPriceRange={setPriceRange}
            handleClear={handleClear}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />

          <div className="w-full space-y-5">
            {isLoading || isError ? (
              <CarCardSkeleton />
            ) : (
              <>
                {cars?.map((car) => (
                  <CarCard car={car} />
                ))}

                <Paginate meta={meta} setPage={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
