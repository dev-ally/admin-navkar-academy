"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import { onValue, orderByKey, query, ref } from "firebase/database";
import { db } from "@/firebase/config";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import ProductCard from "../shared/ProductCard";

const DisplayProducts = () => {
  const [productsData, setProductsData] = useState(null);

  useEffect(() => {
    // const eventsRef = query(ref(db, "products"), orderByKey());

    const unsubscribe = onValue(ref(db, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsData(Object.values(data));
        console.log("DATA", data);
      } else {
        setProductsData([]); // Clear the event data if no events found
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  if (productsData === null) {
    return (
      <h1 className="font-medium py-2 text-center text-2xl flex items-center gap-2 mb-6 md:mb-8">
        <LoaderCircle className="animate-spin" />
        Loading Products
      </h1>
    );
  }

  return (
    <div
      className={`justify-center ${
        productsData.length === 0
          ? "flex"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-x-8 gap-y-10"
      }`}
    >
      {productsData && productsData.length === 0 && (
        <Link
          href="/dashboard/products/add"
          className="py-2 text-center text-2xl flex items-center gap-2 mb-6 md:mb-8"
        >
          Add Product to Get Started
          <ArrowRight />
        </Link>
      )}
      {productsData &&
        productsData.map((product) => (
          <div key={product.pid}>
            <ProductCard
              pid={product.pid}
              ptitle={product.ptitle}
              pdescription={product.pdescription}
              pcoverImg={product.pcoverImg}
              pclass={product.pclass}
              psubject={product.psubject}
              pprice={product.pprice}
              pcreatedAt={product.pcreatedAt}
            />
          </div>
        ))}
    </div>
  );
};

export default DisplayProducts;
