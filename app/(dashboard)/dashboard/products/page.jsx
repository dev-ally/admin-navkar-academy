"use client";

import React, { useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/firebase/config";
import { LoaderCircle } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard"; // Ensure the ProductCard import is included
import Dropdown from "@/components/shared/Dropdown"; // Ensure the Dropdown import is included
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DisplayProducts = ({ selectedClass, selectedSubject }) => {
  const [productsData, setProductsData] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsData(data);
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

  // Prepare classes and subjects
  const classesWithSubjects = Object.entries(productsData).map(
    ([classKey, subjects]) => ({
      class: classKey,
      subjects: Object.keys(subjects).map((subjectKey) => ({
        subject: subjectKey,
        notes: Object.keys(subjects[subjectKey]), // Include notes if needed
      })),
    })
  );

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

const Page = () => {
  const [productsData, setProductsData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsData(data);
      } else {
        setProductsData({});
      }
    });

    return () => unsubscribe();
  }, []);

  // Prepare classes and subjects
  const classesWithSubjects = productsData
    ? Object.entries(productsData).map(([classKey, subjects]) => ({
        class: classKey,
        subjects: Object.keys(subjects).map((subjectKey) => ({
          subject: subjectKey,
        })),
      }))
    : [];

  const handleClassChange = (className) => {
    setSelectedClass(className);
    const selectedClassObj = classesWithSubjects.find(
      (c) => c.class === className
    );
    setFilteredSubjects(
      selectedClassObj ? selectedClassObj.subjects.map((s) => s.subject) : []
    );
    setSelectedSubject(null); // Reset selected subject when class changes
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  return (
    <Container>
      <div className="my-10 flex flex-col px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="font-bold text-center text-3xl md:text-4xl flex items-center gap-2 mb-6 md:mb-8">
            Your Products.
          </h1>
          <Button asChild>
            <Link href="/dashboard/products/add">Add Product</Link>
          </Button>
        </div>
        <div>
          <DisplayProducts
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
          />
        </div>
        <div className="flex gap-4">
          <Dropdown
            trigger="Class"
            options={classesWithSubjects.map((c) => c.class)}
            onChange={handleClassChange}
          />
          <Dropdown
            trigger="Subject"
            options={filteredSubjects}
            onChange={handleSubjectChange}
          />
        </div>
      </div>
    </Container>
  );
};

export default Page;
