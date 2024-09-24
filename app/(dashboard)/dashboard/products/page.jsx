import DisplayProducts from "@/components/private/DisplayProducts";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <Container>
      <div className="my-10 flex flex-col px-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold py-2 text-center text-3xl md:text-4xl flex items-center gap-2 mb-6 md:mb-8">
            Your Products.
          </h1>
          <Button asChild>
            <Link href="/dashboard/products/add">Add Product</Link>
          </Button>
        </div>
        {/* Display Products from database */}
        <div>
          <DisplayProducts />
        </div>
      </div>
    </Container>
  );
};

export default page;
