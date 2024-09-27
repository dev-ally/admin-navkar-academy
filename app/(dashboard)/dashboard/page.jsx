import DCard from "@/components/private/DCard";
import Container from "@/components/shared/Container";
import React from "react";

const DashboardPage = () => {
  const data = [
    {
      id: 1,
      image: "/events.png",
      lNmae: "Events",
      url: "/dashboard/events",
    },
    {
      id: 2,
      image: "/products.png",
      lNmae: "Notes",
      url: "/dashboard/products",
    },
    {
      id: 3,
      image: "/toppers.png",
      lNmae: "Toppers",
      url: "/dashboard/toppers",
    },
  ];

  return (
    <Container>
      {/* Set min-h based on available space after the header */}
      <div className="flex justify-center items-center w-full px-6 min-h-[calc(100vh-230px)]">
        <div className="grid md:grid-cols-3 gap-x-14 gap-y-10">
          {data.map((item) => (
            <DCard
              key={item.id}
              image={item.image}
              lNmae={item.lNmae}
              url={item.url}
            />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default DashboardPage;
