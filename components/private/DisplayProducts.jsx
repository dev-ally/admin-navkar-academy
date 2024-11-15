"use client";

import React, { useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/firebase/config";
import { LoaderCircle } from "lucide-react";
import ProductCard from "../shared/ProductCard";

const DisplayProducts = ({ selectedClass, selectedSubject }) => {
  const [productsData, setProductsData] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsData(data);
        // console.log("DATA", data);
      } else {
        setProductsData({});
      }
    });

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

  // Filter products based on selected class and subject
  const filteredProducts = () => {
    if (!selectedClass && !selectedSubject) {
      // No filters applied, return all products
      return Object.entries(productsData).flatMap(([groupKey, categoryGroup]) =>
        Object.entries(categoryGroup).flatMap(([categoryKey, productList]) =>
          Object.entries(productList).map(([productId, product]) => ({
            productId,
            product,
          }))
        )
      );
    }

    // Filter by selected class and/or subject
    return Object.entries(productsData).flatMap(([groupKey, categoryGroup]) =>
      Object.entries(categoryGroup).flatMap(([categoryKey, productList]) =>
        Object.entries(productList)
          .filter(([productId, product]) => {
            const matchesClass =
              !selectedClass || product.pclass === selectedClass;
            const matchesSubject =
              !selectedSubject || product.psubject === selectedSubject;
            return matchesClass && matchesSubject;
          })
          .map(([productId, product]) => ({
            productId,
            product,
          }))
      )
    );
  };

  const productsToDisplay = filteredProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
      {productsToDisplay.length === 0 ? (
        <p className="text-center text-2xl">No Products Available</p>
      ) : (
        productsToDisplay.map(({ productId, product }) => (
          <ProductCard
            key={productId}
            pid={product.pid}
            ptitle={product.ptitle}
            pdescription={product.pdescription}
            pcoverImg={product.pcoverImg}
            pclass={product.pclass}
            psubject={product.psubject}
            pprice={product.pprice}
            pcreatedAt={product.pcreatedAt}
          />
        ))
      )}
    </div>
  );
};

export default DisplayProducts;
