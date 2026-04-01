import { PropertyCardInteractive } from "@/components/PropertyCardInteractive";
import { allImageUrls, type PropertyWithImages } from "@/types/property";

function formatRentInr(amount: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

type Props = {
  property: PropertyWithImages;
  isLoggedIn: boolean;
};

export function PropertyCard({ property, isLoggedIn }: Props) {
  const imageUrls = allImageUrls(property);
  const formattedRent = formatRentInr(property.price);

  return (
    <PropertyCardInteractive
      property={property}
      imageUrls={imageUrls}
      formattedRent={formattedRent}
      isLoggedIn={isLoggedIn}
    />
  );
}
